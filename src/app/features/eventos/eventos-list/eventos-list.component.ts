import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, switchMap } from 'rxjs';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import {
  TableColumn,
  TableAction,
} from '../../../shared/models/table-column.model';
import { TableButtonConfig } from '../../../shared/models/button-config.model';
import { DataTableComponent } from '../../../shared/models/components/data-table/data-table.component';
import { ModalFormComponent } from '../../../shared/models/components/modal-form/modal-form.component';
import { FormFieldConfig } from '../../../shared/models/form-fields.model';
import { getModalWidth } from '../../../shared/models/components/modal-form/modal-config.model';

import { Evento, EstadoEvento } from '../../../shared/models/evento.model';
import { Cliente } from '../../../shared/models/cliente.model';
import { PaginatedResponse } from '../../../shared/models/paginated-response.model';
import { EventosService } from '../eventos.service';
import { ClientesService } from '../../clientes/clientes.service';

@Component({
  selector: 'app-eventos-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DataTableComponent],
  templateUrl: './eventos-list.component.html',
  styleUrl: './eventos-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventosListComponent {
  private eventosService = inject(EventosService);
  private clientesService = inject(ClientesService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

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
      size: 15,
      sortable: true,
    },
    { name: 'direccion', label: 'Dirección', type: 'string', size: 20 },
    {
      name: 'cantidad_asistentes',
      label: 'Asistentes',
      type: 'number',
      size: 10,
    },
    {
      name: 'estado',
      label: 'Estado',
      type: 'icon',
      size: 15,
      sortable: true,
      accessor: (c) => this.getEstadoEvento(c),
    },
    {
      name: 'precio_final_calculado',
      label: 'Precio',
      type: 'number',
      size: 10,
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
      if (openId) this.abrirEventoPorId(openId);
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
      return { icon: 'pending_actions', color: 'warn', tooltip: 'Pendiente' }; // pendiente
    if (evento.estado === EstadoEvento.Confirmado)
      return { icon: 'event', color: 'confirmed', tooltip: 'Confirmado' }; // confirmado
    if (evento.estado === EstadoEvento.Finalizado)
      return { icon: 'done_outline', color: 'success', tooltip: 'Finalizado' }; // terminado
    return { icon: 'do_not_disturb_on', color: 'cancel', tooltip: 'Cancelado' }; // cancelado
  }

  onRowClick(evento?: Evento) {
    const isEdit = Boolean(evento?._id);
    const fields: FormFieldConfig[] = [
      {
        id: 'fecha_evento',
        type: 'date',
        label: 'Fecha',
        value: evento?.fecha_evento ?? null,
        required: true,
        size: 25,
      },
      {
        id: 'direccion',
        type: 'text',
        label: 'Dirección',
        value: evento?.direccion ?? '',
        required: true,
        size: 75,
      },
      {
        id: 'id_cliente',
        type: 'select',
        label: 'Cliente',
        value: (evento?.id_cliente as any)?._id ?? '',
        options: [],
        required: true,
        size: 50,
      },
      {
        id: 'cantidad_asistentes',
        type: 'number',
        label: 'Asistentes',
        value: evento?.cantidad_asistentes ?? 0,
        required: true,
        size: 25,
      },
      {
        id: 'estado',
        type: 'select',
        label: 'Estado',
        value: evento?.estado ?? EstadoEvento.Pendiente,
        options: Object.entries(EstadoEvento).map(([k, v]) => ({
          value: v,
          label: v,
        })),
        required: true,
        size: 25,
      },
      {
        id: 'precio_final_calculado',
        type: 'number',
        label: 'Precio',
        value: evento?.precio_final_calculado ?? 0,
        required: true,
      },
    ];

    // Load client options asynchronously
    this.clientesService.getAll(1, 1000).subscribe((res) => {
      const clientOptions = res.data.map((c: any) => ({
        value: c._id,
        label: c.nombre,
      }));
      fields.find((f) => f.id === 'id_cliente')!.options = clientOptions;

      const dialogRef = this.dialog.open(ModalFormComponent, {
        width: getModalWidth('md'),
        disableClose: true,
        data: {
          title: isEdit ? `Editar Evento` : `Nuevo Evento`,
          fields,
          onSave: (values: any) =>
            isEdit
              ? this.eventosService.update(evento!._id!, values)
              : this.eventosService.create(values),
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) this.state$.next(this.state$.value);
      });
    });
  }

  private abrirEventoPorId(id: string) {
    this.eventosService.getById(id).subscribe({
      next: (evento) => this.openEventoModal(evento),
      error: () => {
        // TODO opcional: mostrar un aviso si el evento ya no existe
      },
    });

    // Limpia el query param de la URL para que no se reabra si el usuario refresca
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      replaceUrl: true,
    });
  }

  openEventoModal(evento: Evento) {
    const cliente = evento.id_cliente as any; // populado por el backend
    const tipoBarra = evento.id_tipo_barra as any;

    const fields: FormFieldConfig[] = [
      {
        id: 'cliente',
        type: 'text',
        label: 'Cliente',
        value: cliente?.nombre ?? '',
        size: 50,
        editable: false,
      },
      {
        id: 'tipoBarra',
        type: 'text',
        label: 'Tipo de Barra',
        value: tipoBarra?.nombre_barra ?? '',
        size: 50,
        editable: false,
      },
      {
        id: 'fecha_evento',
        type: 'date',
        label: 'Fecha del evento',
        value: evento.fecha_evento,
        size: 50,
        required: true,
      },
      {
        id: 'estado',
        type: 'select',
        label: 'Estado',
        value: evento.estado,
        size: 50,
        required: true,
        options: [
          { value: 'Cotizado', label: 'Cotizado' },
          { value: 'Confirmado', label: 'Confirmado' },
          { value: 'Finalizado', label: 'Finalizado' },
          { value: 'Cancelado', label: 'Cancelado' },
        ],
      },
      {
        id: 'direccion',
        type: 'text',
        label: 'Dirección',
        value: evento.direccion,
        size: 100,
        required: true,
      },
      {
        id: 'cantidad_asistentes',
        type: 'number',
        label: 'Asistentes',
        value: evento.cantidad_asistentes,
        size: 50,
        required: true,
      },
      {
        id: 'precio_final_calculado',
        type: 'number',
        label: 'Precio Final (€)',
        value: evento.precio_final_calculado,
        size: 50,
      },
      {
        id: 'logistica_notas',
        type: 'text',
        label: 'Notas logísticas',
        value: evento.logistica_notas,
        size: 100,
      },
    ];

    const dialogRef = this.dialog.open(ModalFormComponent, {
      width: '700px',
      data: {
        title: `Evento: ${cliente?.nombre ?? ''}`,
        fields,
        onSave: (values: any) =>
          this.eventosService.update(evento._id!, values),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.state$.next(this.state$.value); // refresca el listado si se guardó algo
    });
  }
}
