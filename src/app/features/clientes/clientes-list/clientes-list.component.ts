import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../clientes.service';
import { Cliente } from '../../../shared/models/cliente.model';
import { RouterModule } from '@angular/router';
import { BehaviorSubject, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './clientes-list.component.html',
  styleUrl: './clientes-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientesListComponent implements OnInit {
  private clientesService = inject(ClientesService);
  
  page$ = new BehaviorSubject<number>(1);
  limit = 10;
  
  clientes = signal<Cliente[]>([]);
  totalPages = signal<number>(1);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.page$.pipe(
      switchMap(page => {
        this.loading.set(true);
        return this.clientesService.getAll(page, this.limit);
      })
    ).subscribe({
      next: (res) => {
        this.clientes.set(res.data);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.page$.next(newPage);
    }
  }

  deleteCliente(id: string) {
    if (confirm('¿Seguro que deseas eliminar este cliente?')) {
      this.clientesService.delete(id).subscribe({
        next: () => this.page$.next(this.page$.value), // Refresh
      }); // Error is handled by interceptor
    }
  }
}
