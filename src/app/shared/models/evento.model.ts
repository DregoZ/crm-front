import { Cliente } from './cliente.model';
import { TipoBarra } from './tipo-barra.model';

export const EstadoEvento = {
  Pendiente: 'Pendiente',
  Confirmado: 'Confirmado',
  Finalizado: 'Finalizado',
  Cancelado: 'Cancelado',
} as const;

// Creamos el tipo derivado del objeto
export type EstadoEvento = (typeof EstadoEvento)[keyof typeof EstadoEvento];

export interface Evento {
  _id?: string;
  id_cliente: string | Cliente;
  id_tipo_barra: string | TipoBarra;
  fecha_evento: Date | string;
  direccion: string;
  cantidad_asistentes: number;
  estado: EstadoEvento;
  logistica_notas?: string;
  precio_final_calculado: number;
}
