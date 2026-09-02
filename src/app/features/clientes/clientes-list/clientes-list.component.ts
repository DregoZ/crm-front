import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../clientes.service';
import { Cliente } from '../../../shared/models/cliente.model';
import { Router, RouterModule } from '@angular/router';
import { BehaviorSubject, combineLatest, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DataTableComponent } from '../../../shared/models/components/data-table/data-table.component';
import {
  TableAction,
  TableColumn,
} from '../../../shared/models/table-column.model';
import { Sort } from '@angular/material/sort';
import { ListState } from '../../../shared/models/list-states';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../../../shared/models/components/button/button.component';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DataTableComponent,
    MatIconModule,
    ButtonComponent,
  ],
  templateUrl: './clientes-list.component.html',
  styleUrl: './clientes-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientesListComponent implements OnInit {
  private clientesService = inject(ClientesService);
  private router = inject(Router);

  page$ = new BehaviorSubject<number>(1);
  sort$ = new BehaviorSubject<Sort>({
    active: 'fecha_registro',
    direction: 'desc',
  });
  limit = 10;

  clientes = signal<Cliente[]>([]);
  totalPages = signal<number>(1);
  loading = signal<boolean>(true);

  columns: TableColumn<Cliente>[] = [
    { name: 'nombre', label: 'Nombre', type: 'string', size: 25 },
    { name: 'telefono', label: 'Teléfono', type: 'string', size: 20 },
    { name: 'email', label: 'Email', type: 'string', size: 25 },
    { name: 'fecha_registro', label: 'Fecha Registro', type: 'date', size: 20 },
    { name: 'activo', label: 'Activo', type: 'boolean', size: 20 },
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

  state$ = new BehaviorSubject<ListState>({
    page: 1,
    sort: { active: 'fecha_registro', direction: 'desc' },
  });

  ngOnInit() {
    this.state$
      .pipe(
        switchMap(({ page, sort }) => {
          this.loading.set(true);
          return this.clientesService.getAll(
            page,
            this.limit,
            sort.active,
            sort.direction as 'asc' | 'desc',
          );
        }),
      )
      .subscribe({
        next: (res) => {
          this.clientes.set(res.data);
          this.totalPages.set(res.totalPages);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.state$.next({ ...this.state$.value, page: newPage });
    }
  }

  onSortChange(sort: Sort) {
    this.state$.next({ page: 1, sort }); // una sola emisión, page y sort a la vez
  }

  deleteCliente(id: string) {
    if (confirm('¿Seguro que deseas eliminar este cliente?')) {
      this.clientesService.delete(id).subscribe({
        next: () => this.page$.next(this.page$.value), // Refresh
      }); // Error is handled by interceptor
    }
  }
}
