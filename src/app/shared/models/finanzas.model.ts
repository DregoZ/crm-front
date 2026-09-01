import { Evento } from './evento.model';

export interface Finanzas {
  _id?: string;
  id_evento: string | Evento;
  porcentaje_reserva: number;
  monto_reserva_pagado: boolean;
  monto_total_liquidado: boolean;
  metodo_pago: 'Transferencia' | 'Efectivo' | 'Bizum' | 'Tarjeta';
}
