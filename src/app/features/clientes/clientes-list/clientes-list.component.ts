import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../clientes.service';
import { Cliente } from '../../../shared/models/cliente.model';
import { Router, RouterModule } from '@angular/router';
import { BehaviorSubject, switchMap } from 'rxjs';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import {
  TableAction,
  TableColumn,
} from '../../../shared/models/table-column.model';
import { DataTableComponent } from '../../../shared/models/components/data-table/data-table.component';
import { TableButtonConfig } from '../../../shared/models/button-config.model';

interface ListState {
  pageIndex: number; // 0-based, para el paginador
  sort: Sort;
  search: string;
}

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DataTableComponent],
  templateUrl: './clientes-list.component.html',
  styleUrl: './clientes-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientesListComponent {
  private clientesService = inject(ClientesService);
  private router = inject(Router);

  limit = 10;

  clientes = signal<Cliente[]>([]);
  total = signal<number>(0);
  loading = signal<boolean>(true);

  state$ = new BehaviorSubject<ListState>({
    pageIndex: 0,
    sort: { active: 'fecha_registro', direction: 'desc' },
    search: '',
  });

  columns: TableColumn<Cliente>[] = [
    { name: 'nombre', label: 'Nombre', type: 'string', size: 25 },
    { name: 'telefono', label: 'Teléfono', type: 'string', size: 20 },
    { name: 'email', label: 'Email', type: 'string', size: 25 },
    { name: 'fecha_registro', label: 'Fecha Registro', type: 'date', size: 20 },
  ];

  options: TableButtonConfig[] = [
    {
      label: 'Nuevo Cliente',
      variant: 'primary',
      icon: 'person_add',
      routerLink: 'nuevo',
    },
  ];

  actions: TableAction<Cliente>[] = [
    {
      icon: 'visibility',
      label: 'Ver',
      handler: (c) => this.router.navigate([c._id]),
    },
    {
      icon: 'edit',
      label: 'Editar',
      handler: (c) => this.router.navigate([c._id, 'editar']),
    },
    {
      icon: 'delete',
      label: 'Borrar',
      cssClass: 'btn-danger',
      handler: (c) => this.deleteCliente(c._id!),
    },
  ];

  constructor() {
    this.state$
      .pipe(
        switchMap(({ pageIndex, sort, search }) => {
          this.loading.set(true);
          return this.clientesService.getAll(
            pageIndex + 1, // backend espera página 1-indexada
            this.limit,
            sort.active,
            sort.direction as 'asc' | 'desc',
            search,
          );
        }),
      )
      .subscribe({
        next: (res) => {
          this.clientes.set(res.data);
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

  deleteCliente(id: string) {
    if (confirm('¿Seguro que deseas eliminar este cliente?')) {
      this.clientesService.delete(id).subscribe({
        next: () => this.state$.next(this.state$.value), // refresca la página actual
      });
    }
  }
}
