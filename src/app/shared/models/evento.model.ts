import { Cliente } from './cliente.model';
import { TipoBarra } from './tipo-barra.model';

export type EstadoEvento = 'Cotizado' | 'Confirmado' | 'Finalizado' | 'Cancelado';

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
