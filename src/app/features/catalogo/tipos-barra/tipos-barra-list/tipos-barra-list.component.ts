import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { BehaviorSubject, switchMap } from 'rxjs';
import { DataTableComponent } from '../../../../shared/models/components/data-table/data-table.component';
import { TableButtonConfig } from '../../../../shared/models/button-config.model';
import {
  TableAction,
  TableColumn,
} from '../../../../shared/models/table-column.model';
import { TipoBarra } from '../../../../shared/models/tipo-barra.model';
import { Coctel } from '../../../../shared/models/coctel.model';
import { PaginatedResponse } from '../../../../shared/models/paginated-response.model';
import { TiposBarraService } from '../tipos-barra.service';
import { CoctelesService } from '../../cocteles/cocteles.service';
import { ModalFormComponent } from '../../../../shared/models/components/modal-form/modal-form.component';
import {
  FormFieldConfig,
  SelectOption,
} from '../../../../shared/models/form-fields.model';
import { getModalWidth } from '../../../../shared/models/components/modal-form/modal-config.model';

@Component({
  selector: 'app-tipos-barra-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DataTableComponent],
  templateUrl: './tipos-barra-list.component.html',
  styleUrl: './tipos-barra-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TiposBarraListComponent implements OnInit {
  private barrasService = inject(TiposBarraService);
  private coctelesService = inject(CoctelesService);
  private dialog = inject(MatDialog);

  limit = 10;
  barras = signal<TipoBarra[]>([]);
  coctelOptions = signal<SelectOption[]>([]);
  total = signal<number>(0);
  loading = signal<boolean>(true);

  state$ = new BehaviorSubject<{
    pageIndex: number;
    sort: Sort;
    search: string;
  }>({
    pageIndex: 0,
    sort: { active: 'nombre_barra', direction: 'asc' },
    search: '',
  });

  columns: TableColumn<TipoBarra>[] = [
    {
      name: 'nombre_barra',
      label: 'Tipo de Barra',
      type: 'string',
      size: 25,
      sortable: true,
    },
    {
      name: 'precio_persona',
      label: 'Precio / Persona',
      type: 'currency',
      size: 15,
      sortable: true,
    },
    {
      name: 'descripcion',
      label: 'Descripción',
      type: 'string',
      size: 30,
    },
    {
      name: 'lista_cocteles',
      label: 'Cócteles Incluidos',
      type: 'string',
      size: 30,
      accessor: (b) => this.formatCocteles(b),
    },
  ];

  options: TableButtonConfig[] = [
    {
      label: 'Nuevo Tipo de Barra',
      variant: 'primary',
      icon: 'local_bar',
      onClick: () => this.openBarraModal(undefined),
    },
  ];

  actions: TableAction<TipoBarra>[] = [
    {
      icon: 'visibility',
      label: 'Ver / Editar',
      handler: (b) => this.openBarraModal(b),
    },
    {
      icon: 'delete',
      label: 'Borrar',
      cssClass: 'btn-danger',
      handler: (b) => this.deleteBarra(b._id!),
    },
  ];

  constructor() {
    this.state$
      .pipe(
        switchMap(({ pageIndex, sort, search }) => {
          this.loading.set(true);
          return this.barrasService.getAll(
            pageIndex + 1,
            this.limit,
            sort.active,
            sort.direction as 'asc' | 'desc',
            search,
          );
        }),
      )
      .subscribe({
        next: (res: PaginatedResponse<TipoBarra>) => {
          this.barras.set(res.data);
          this.total.set(res.total);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  ngOnInit() {
    this.cargarCocteles();
  }

  cargarCocteles() {
    this.coctelesService.getAll(1, 100, 'nombre', 'asc').subscribe({
      next: (res) => {
        this.coctelOptions.set(
          res.data.map((c) => ({
            value: c._id!,
            label: `${c.nombre} (${c.cristaleria || (c as any).tipo_vaso?.nombre || 'Vaso std'})`,
          })),
        );
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

  onRowClick(barra?: TipoBarra) {
    this.openBarraModal(barra);
  }

  deleteBarra(id: string) {
    if (confirm('¿Seguro que deseas eliminar este tipo de barra?')) {
      this.barrasService.delete(id).subscribe({
        next: () => this.state$.next(this.state$.value),
      });
    }
  }

  formatCocteles(barra: TipoBarra): string {
    if (!barra.lista_cocteles || barra.lista_cocteles.length === 0) {
      return 'Sin cócteles asignados';
    }
    const nombres = barra.lista_cocteles.map((item: any) =>
      typeof item === 'object' && item.nombre ? item.nombre : 'Cóctel',
    );
    return `${nombres.length} cócteles: ${nombres.join(', ')}`;
  }

  openBarraModal(barra?: TipoBarra) {
    const isEdit = Boolean(barra?._id);

    // Obtener los IDs de cócteles preseleccionados
    const selectedCoctelesIds: string[] = (barra?.lista_cocteles || []).map(
      (c: any) => (typeof c === 'object' && c._id ? c._id : String(c)),
    );

    const fields: FormFieldConfig[] = [
      {
        id: 'nombre_barra',
        type: 'text',
        label: 'Nombre del paquete / barra',
        value: barra?.nombre_barra ?? '',
        size: 65,
        required: true,
      },
      {
        id: 'precio_persona',
        type: 'currency',
        label: 'Precio por persona (€)',
        value: barra?.precio_persona ?? '',
        size: 35,
        required: true,
      },
      {
        id: 'descripcion',
        type: 'textarea',
        label: 'Descripción de la propuesta de barra',
        value: barra?.descripcion ?? '',
        size: 100,
        rows: 2,
        required: true,
      },
      {
        id: 'lista_cocteles',
        type: 'select',
        label: 'Cócteles incluidos en esta barra',
        value: selectedCoctelesIds,
        options: this.coctelOptions(),
        multiple: true,
        size: 100,
      },
    ];

    const dialogRef = this.dialog.open(ModalFormComponent, {
      width: getModalWidth('md'),
      disableClose: true,
      data: {
        title: isEdit
          ? `Editar Barra: ${barra?.nombre_barra}`
          : 'Nuevo Tipo de Barra',
        fields,
        onSave: (values: any) => {
          const payload = {
            nombre_barra: values.nombre_barra,
            precio_persona: Number(values.precio_persona),
            descripcion: values.descripcion,
            lista_cocteles: values.lista_cocteles || [],
          };
          return isEdit
            ? this.barrasService.update(barra!._id!, payload)
            : this.barrasService.create(payload);
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.state$.next(this.state$.value);
    });
  }
}
