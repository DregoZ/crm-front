import {
  Component,
  ChangeDetectionStrategy,
  inject,
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
import { Coctel } from '../../../../shared/models/coctel.model';
import { PaginatedResponse } from '../../../../shared/models/paginated-response.model';
import { CoctelesService } from '../cocteles.service';
import { CoctelFormComponent } from '../coctel-form/coctel-form.component';

@Component({
  selector: 'app-cocteles-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DataTableComponent],
  templateUrl: './cocteles-list.component.html',
  styleUrl: './cocteles-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoctelesListComponent {
  private coctelesService = inject(CoctelesService);
  private dialog = inject(MatDialog);

  limit = 10;
  cocteles = signal<Coctel[]>([]);
  total = signal<number>(0);
  loading = signal<boolean>(true);

  state$ = new BehaviorSubject<{
    pageIndex: number;
    sort: Sort;
    search: string;
  }>({
    pageIndex: 0,
    sort: { active: 'nombre', direction: 'asc' },
    search: '',
  });

  columns: TableColumn<Coctel>[] = [
    {
      name: 'nombre',
      label: 'Cóctel',
      type: 'string',
      size: 25,
      sortable: true,
    },
    {
      name: 'cristaleria',
      label: 'Cristalería / Vaso',
      type: 'string',
      size: 25,
      sortable: true,
      accessor: (c) => c.cristaleria || (c as any).tipo_vaso?.nombre || '-',
    },
    {
      name: 'ingredientes',
      label: 'Receta / Insumos',
      type: 'string',
      size: 50,
      accessor: (c) => this.formatIngredientes(c),
    },
  ];

  options: TableButtonConfig[] = [
    {
      label: 'Nuevo Cóctel',
      variant: 'primary',
      icon: 'local_bar',
      onClick: () => this.openCoctelModal(undefined),
    },
  ];

  actions: TableAction<Coctel>[] = [
    {
      icon: 'visibility',
      label: 'Ver / Editar',
      handler: (c) => this.openCoctelModal(c),
    },
    {
      icon: 'delete',
      label: 'Borrar',
      cssClass: 'btn-danger',
      handler: (c) => this.deleteCoctel(c._id!),
    },
  ];

  constructor() {
    this.state$
      .pipe(
        switchMap(({ pageIndex, sort, search }) => {
          this.loading.set(true);
          return this.coctelesService.getAll(
            pageIndex + 1,
            this.limit,
            sort.active,
            sort.direction as 'asc' | 'desc',
            search,
          );
        }),
      )
      .subscribe({
        next: (res: PaginatedResponse<Coctel>) => {
          this.cocteles.set(res.data);
          this.total.set(res.total);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
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

  onRowClick(coctel?: Coctel) {
    this.openCoctelModal(coctel);
  }

  deleteCoctel(id: string) {
    if (confirm('¿Seguro que deseas eliminar este cóctel del catálogo?')) {
      this.coctelesService.delete(id).subscribe({
        next: () => this.state$.next(this.state$.value),
      });
    }
  }

  formatIngredientes(coctel: Coctel): string {
    if (!coctel.ingredientes || coctel.ingredientes.length === 0) {
      return 'Sin ingredientes especificados';
    }
    const resumen = coctel.ingredientes
      .map((i) => `${i.nombre_insumo} (${i.cantidad_por_persona} ${i.unidad_medida})`)
      .join(', ');
    return `${coctel.ingredientes.length} insumos: ${resumen}`;
  }

  openCoctelModal(coctel?: Coctel) {
    const dialogRef = this.dialog.open(CoctelFormComponent, {
      width: '680px',
      disableClose: true,
      data: { coctel },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.state$.next(this.state$.value);
    });
  }
}
