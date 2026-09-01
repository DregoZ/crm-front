import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientesService } from '../clientes.service';
import { EventosService } from '../../eventos/eventos.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Cliente } from '../../../shared/models/cliente.model';
import { Evento } from '../../../shared/models/evento.model';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-cliente-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cliente-detalle.component.html',
  styleUrl: './cliente-detalle.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClienteDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private clientesService = inject(ClientesService);
  private eventosService = inject(EventosService); // Usar servicio real

  cliente = signal<Cliente | null>(null);
  historialEventos = signal<Evento[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id')!;
        this.loading.set(true);
        return this.clientesService.getById(id);
      })
    ).subscribe({
      next: (cli) => {
        this.cliente.set(cli);
        this.cargarHistorial(cli._id!);
      },
      error: () => this.loading.set(false)
    });
  }

  private cargarHistorial(clienteId: string) {
    this.eventosService.getByCliente(clienteId).subscribe({
      next: (eventos) => {
        this.historialEventos.set(eventos);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
