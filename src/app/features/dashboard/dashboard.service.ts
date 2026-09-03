import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  MetricasDashboard,
  AlertaDashboard,
} from '../../shared/models/dashboard.model';
import { Evento } from '../../shared/models/evento.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  // En un entorno real se usaría HttpClient:
  // constructor(private http: HttpClient) {}

  getResumen(): Observable<{
    metricas: MetricasDashboard;
    proximosEventos: Evento[];
    alertas: AlertaDashboard[];
  }> {
    // Mock data
    return of({
      metricas: {
        eventosConfirmadosMes: 12,
        facturacionProyectada: 4500,
        presupuestosPendientes: 5,
      },
      proximosEventos: [
        {
          _id: 'e1',
          id_cliente: 'Cliente A', // mock
          id_tipo_barra: 'Premium', // mock
          fecha_evento: new Date(Date.now() + 86400000 * 2),
          direccion: 'Calle Falsa 123',
          cantidad_asistentes: 50,
          estado: 'Confirmado',
          precio_final_calculado: 1250,
        } as Evento,
        {
          _id: 'e2',
          id_cliente: 'Cliente B',
          id_tipo_barra: 'Estándar',
          fecha_evento: new Date(Date.now() + 86400000 * 5),
          direccion: 'Avenida Siempreviva 742',
          cantidad_asistentes: 30,
          estado: 'Pendiente',
          precio_final_calculado: 450,
        } as Evento,
      ],
      alertas: [
        {
          id: 'a1',
          mensaje: 'Falta confirmar menú para el evento e1',
          tipo: 'warning',
          fecha: new Date(),
        } as AlertaDashboard,
      ],
    }).pipe(delay(500));
  }
}
