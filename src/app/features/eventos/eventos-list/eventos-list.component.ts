import { CommonModule, formatDate } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  LOCALE_ID,
  OnInit,
  signal,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BehaviorSubject, switchMap } from 'rxjs';
import { TableButtonConfig } from '../../../shared/models/button-config.model';
import { DataTableComponent } from '../../../shared/models/components/data-table/data-table.component';
import { getModalWidth } from '../../../shared/models/components/modal-form/modal-config.model';
import { ModalFormComponent } from '../../../shared/models/components/modal-form/modal-form.component';
import {
  FormFieldConfig,
  SelectOption,
} from '../../../shared/models/form-fields.model';
import {
  TableAction,
  TableColumn,
} from '../../../shared/models/table-column.model';
import { Cliente } from '../../../shared/models/cliente.model';
import { EstadoEvento, Evento } from '../../../shared/models/evento.model';
import { PaginatedResponse } from '../../../shared/models/paginated-response.model';
import { EventosService } from '../eventos.service';
import { TiposBarraService } from '../../tipos-barra/tipos-barra.service';
import { ClientesService } from '../../clientes/clientes.service';
import { TipoBarra } from '../../../shared/models/tipo-barra.model';

@Component({
  selector: 'app-eventos-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DataTableComponent],
  templateUrl: './eventos-list.component.html',
  styleUrl: './eventos-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventosListComponent implements OnInit {
  private locale = inject(LOCALE_ID);
  private eventosService = inject(EventosService);
  private barrasService = inject(TiposBarraService);
  private clientesService = inject(ClientesService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  barras = signal<TipoBarra[]>([]);
  tipoBarraOptions = signal<SelectOption[]>([]);
  clienteOptions = signal<SelectOption[]>([]);
  limit = 10;
  eventos = signal<Evento[]>([]);
  total = signal<number>(0);
  loading = signal<boolean>(true);

  state$ = new BehaviorSubject<{
    pageIndex: number;
    sort: Sort;
    search: string;
  }>({
    pageIndex: 0,
    sort: { active: 'fecha_evento', direction: 'desc' },
    search: '',
  });

  columns: TableColumn<Evento>[] = [
    {
      name: 'fecha_evento',
      label: 'Fecha',
      type: 'date',
      size: 10,
      sortable: true,
    },
    { name: 'direccion', label: 'Dirección', type: 'string', size: 20 },
    {
      name: 'nombre_barra',
      label: 'Tipo Barra',
      type: 'string',
      size: 10,
      accessor: (row) => (row.id_tipo_barra as any)?.nombre_barra || '',
    },
    {
      name: 'precio_persona',
      label: 'PPP',
      type: 'currency',
      size: 10,
      accessor: (row) => (row.id_tipo_barra as any)?.precio_persona || '',
    },
    {
      name: 'cantidad_asistentes',
      label: 'Asistentes',
      type: 'number',
      size: 10,
    },
    {
      name: 'precio_final',
      label: 'Estimado',
      type: 'number',
      size: 10,
      accessor: (row) => this.calculoEstimado(row) || 0,
    },
    {
      name: 'estado',
      label: 'Estado',
      type: 'icon',
      size: 10,
      sortable: true,
      accessor: (c) => this.getEstadoEvento(c),
    },
    {
      name: 'cliente',
      label: 'Cliente',
      type: 'string',
      size: 20,
      accessor: (e: any) => (e.id_cliente as Cliente)?.nombre,
    },
  ];

  options: TableButtonConfig[] = [
    {
      label: 'Nuevo Evento',
      variant: 'primary',
      icon: 'event',
      onClick: () => this.onRowClick(undefined),
    },
  ];

  actions: TableAction<Evento>[] = [
    {
      icon: 'visibility',
      label: 'Ver',
      handler: (c) => this.onRowClick(c),
    },
    {
      icon: 'delete',
      label: 'Borrar',
      cssClass: 'btn-danger',
      handler: (e) => this.deleteEvento(e._id!),
    },
  ];

  constructor() {
    this.state$
      .pipe(
        switchMap(({ pageIndex, sort, search }) => {
          this.loading.set(true);
          return this.eventosService.getAll(
            pageIndex + 1,
            this.limit,
            sort.active,
            sort.direction as 'asc' | 'desc',
            search,
          );
        }),
      )
      .subscribe({
        next: (res: PaginatedResponse<Evento>) => {
          this.eventos.set(res.data);
          this.total.set(res.total);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });

    this.route.queryParamMap.subscribe((params) => {
      const openId = params.get('openId');
      if (openId) {
        this.abrirEventoPorId(openId);
      } else {
        const clienteId = params.get('clienteId');
        if (clienteId) {
          this.openEventoModal({ id_cliente: clienteId } as any);
        }
      }
    });
  }

  ngOnInit() {
    this.cargarBarras();
    this.cargarClientes();
  }

  cargarBarras() {
    this.barrasService.getAll(1, 100).subscribe((barras) => {
      this.barras.set(barras.data);
      this.tipoBarraOptions.set(
        barras.data.map((barra) => ({
          value: barra._id!,
          label: `${barra.nombre_barra} (${barra.precio_persona} €/p)`,
        })),
      );
    });
  }

  cargarClientes(onLoaded?: () => void) {
    this.clientesService.getAll(1, 100, 'nombre', 'asc').subscribe({
      next: (res) => {
        this.clienteOptions.set(
          res.data.map((cliente) => ({
            value: cliente._id!,
            label: `${cliente.nombre} (${cliente.telefono || 'Sin tel.'})`,
          })),
        );
        if (onLoaded) onLoaded();
      },
    });
  }

  onPageChange(event: PageEvent) {
    this.state$.next({ ...this.state$.value, pageIndex: event.pageIndex });
  }

  onSortChange(sort: Sort) {
    this.state$.next({ ...this.state$.value, pageIndex: 0, sort });
  }

  onSearchChange(search: string) {
    this.state$.next({ ...this.state$.value, pageIndex: 0, search });
  }

  deleteEvento(id: string) {
    if (confirm('¿Seguro que deseas eliminar este evento?')) {
      this.eventosService
        .delete(id)
        .subscribe({ next: () => this.state$.next(this.state$.value) });
    }
  }

  getEstadoEvento(evento: Evento): {
    icon: string;
    color: string;
    tooltip: string;
  } {
    if (!evento) return { icon: '', color: '', tooltip: '' };
    if (evento.estado === EstadoEvento.Pendiente)
      return { icon: 'pending_actions', color: 'warn', tooltip: 'Pendiente' };
    if (evento.estado === EstadoEvento.Confirmado)
      return { icon: 'event', color: 'confirmed', tooltip: 'Confirmado' };
    if (evento.estado === EstadoEvento.Finalizado)
      return { icon: 'done_outline', color: 'success', tooltip: 'Finalizado' };
    return { icon: 'do_not_disturb_on', color: 'cancel', tooltip: 'Cancelado' };
  }

  onRowClick(evento?: Evento) {
    this.openEventoModal(evento);
  }

  calculoEstimado(row: Evento) {
    const asistentes = row?.cantidad_asistentes || 0;
    const precioPersona = (row?.id_tipo_barra as any)?.precio_persona || 0;
    return asistentes * precioPersona;
  }

  private abrirEventoPorId(id: string) {
    this.eventosService.getById(id).subscribe({
      next: (evento) => this.openEventoModal(evento),
      error: () => {},
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    });
  }

  abrirModalNuevoCliente(eventoDialogRef?: MatDialogRef<ModalFormComponent>) {
    const fields: FormFieldConfig[] = [
      {
        id: 'nombre',
        type: 'text',
        label: 'Nombre completo',
        size: 100,
        required: true,
      },
      {
        id: 'telefono',
        type: 'text',
        label: 'Teléfono',
        size: 50,
        required: true,
      },
      {
        id: 'email',
        type: 'text',
        label: 'Email',
        size: 50,
      },
      {
        id: 'notas_gustos',
        type: 'textarea',
        label: 'Notas de gustos / preferencias',
        size: 100,
        rows: 2,
      },
    ];

    const clientDialogRef = this.dialog.open(ModalFormComponent, {
      width: getModalWidth('sm'),
      disableClose: true,
      data: {
        title: 'Crear Nuevo Cliente',
        fields,
        onSave: (values: any) => this.clientesService.create(values),
      },
    });

    clientDialogRef.afterClosed().subscribe((nuevoCliente: Cliente) => {
      if (nuevoCliente && nuevoCliente._id) {
        const nuevaOpcion: SelectOption = {
          value: nuevoCliente._id,
          label: `${nuevoCliente.nombre} (${nuevoCliente.telefono || 'Sin tel.'})`,
        };

        // 1. Actualizar el signal global de opciones de cliente
        this.clienteOptions.update((opts) => [nuevaOpcion, ...opts]);

        // 2. Si el modal de evento sigue abierto, actualizar las opciones del selector y preseleccionarlo
        if (eventoDialogRef?.componentInstance) {
          const formInstance = eventoDialogRef.componentInstance;
          const clienteField = formInstance.fields?.find(
            (f: FormFieldConfig) => f.id === 'id_cliente',
          );
          if (clienteField) {
            clienteField.options = [nuevaOpcion, ...(clienteField.options || [])];
          }
          formInstance.form.get('id_cliente')?.setValue(nuevoCliente._id);
        }
      }
    });
  }

  openEventoModal(evento?: Evento) {
    const isEdit = Boolean(evento?._id);
    const clienteId =
      (evento?.id_cliente as any)?._id || (evento?.id_cliente as string) || '';
    const tipoBarraId =
      (evento?.id_tipo_barra as any)?._id ||
      (evento?.id_tipo_barra as string) ||
      '';
    const tipoBarra = evento?.id_tipo_barra as any;

    const fields: FormFieldConfig[] = [
      {
        id: 'id_cliente',
        type: 'select',
        label: 'Cliente',
        value: clienteId,
        options: this.clienteOptions(),
        size: 65,
        required: true,
      },
      {
        id: 'btn_nuevo_cliente',
        type: 'button',
        label: '+ Nuevo Cliente',
        size: 35,
        onClick: () => this.abrirModalNuevoCliente(dialogRef),
      },
      {
        id: 'id_tipo_barra',
        type: 'select',
        label: 'Tipo de Barra',
        value: tipoBarraId,
        options: this.tipoBarraOptions(),
        size: 65,
        required: true,
      },
      {
        id: 'precio_persona',
        type: 'currency',
        label: 'Precio p/p (€)',
        value: tipoBarra?.precio_persona ?? '',
        size: 35,
        editable: false,
      },
      {
        id: 'fecha_evento',
        type: 'date',
        label: 'Fecha del evento',
        value: evento?.fecha_evento,
        size: 50,
        required: true,
      },
      {
        id: 'estado',
        type: 'select',
        label: 'Estado',
        value: evento?.estado ?? EstadoEvento.Pendiente,
        size: 50,
        required: true,
        options: [
          { value: EstadoEvento.Pendiente, label: 'Pendiente' },
          { value: EstadoEvento.Confirmado, label: 'Confirmado' },
          { value: EstadoEvento.Finalizado, label: 'Finalizado' },
          { value: EstadoEvento.Cancelado, label: 'Cancelado' },
        ],
      },
      {
        id: 'direccion',
        type: 'text',
        label: 'Dirección del evento',
        value: evento?.direccion ?? '',
        size: 100,
        required: true,
      },
      {
        id: 'cantidad_asistentes',
        type: 'number',
        label: 'Asistentes',
        value: evento?.cantidad_asistentes ?? '',
        size: 30,
        required: true,
      },
      {
        id: 'precio_estimado',
        type: 'currency',
        label: 'Precio Estimado (€)',
        value: this.calculoEstimado(<Evento>evento) || 0,
        size: 35,
        editable: false,
      },
      {
        id: 'precio_final',
        type: 'currency',
        label: 'Precio Final (€)',
        value: evento?.precio_final ?? '',
        size: 35,
        placeholder: 'Opcional (si difiere del estimado)',
      },
      {
        id: 'logistica_notas',
        type: 'textarea',
        label: 'Notas logísticas',
        value: evento?.logistica_notas ?? '',
        size: 100,
      },
    ];

    const dialogRef = this.dialog.open(ModalFormComponent, {
      width: getModalWidth('md'),
      disableClose: true,
      data: {
        title: isEdit
          ? `Detalle Evento: ${evento?.fecha_evento ? formatDate(evento.fecha_evento, 'dd/MM/yyyy', this.locale) : ''}`
          : 'Nuevo Evento',
        fields,
        onSave: (values: any) => {
          const selectedBarra = this.barras().find(
            (b) => b._id === values.id_tipo_barra,
          );
          const precioPersona =
            selectedBarra?.precio_persona ??
            (evento?.id_tipo_barra as any)?.precio_persona ??
            0;
          const asistentes = Number(values.cantidad_asistentes || 0);

          const payload: any = {
            id_cliente: values.id_cliente,
            id_tipo_barra: selectedBarra
              ? {
                  _id: selectedBarra._id,
                  nombre_barra: selectedBarra.nombre_barra,
                  precio_persona: selectedBarra.precio_persona,
                }
              : evento?.id_tipo_barra,
            fecha_evento: values.fecha_evento,
            direccion: values.direccion,
            cantidad_asistentes: asistentes,
            estado: values.estado,
            logistica_notas: values.logistica_notas || '',
            precio_final:
              values.precio_final !== null &&
              values.precio_final !== '' &&
              !isNaN(Number(values.precio_final))
                ? Number(values.precio_final)
                : asistentes * precioPersona,
          };

          return isEdit
            ? this.eventosService.update(evento!._id!, payload)
            : this.eventosService.create(payload);
        },
      },
    });

    // Reactividad en tiempo real en los campos del formulario
    const form = dialogRef.componentInstance.form;

    form.get('id_tipo_barra')?.valueChanges.subscribe((barraId) => {
      const b = this.barras().find((x) => x._id === barraId);
      if (b) {
        form.get('precio_persona')?.setValue(b.precio_persona);
        const asistentes = Number(form.get('cantidad_asistentes')?.value || 0);
        form.get('precio_estimado')?.setValue(asistentes * b.precio_persona);
      }
    });

    form.get('cantidad_asistentes')?.valueChanges.subscribe((cant) => {
      const pPersona = Number(form.get('precio_persona')?.value || 0);
      form.get('precio_estimado')?.setValue(Number(cant || 0) * pPersona);
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.state$.next(this.state$.value);
    });
  }
}
