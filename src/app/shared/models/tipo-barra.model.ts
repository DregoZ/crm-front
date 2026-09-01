import { Coctel } from './coctel.model';

export interface TipoBarra {
  _id?: string;
  nombre_barra: string;
  descripcion: string;
  precio_base_persona: number;
  lista_cocteles: string[] | Coctel[];
}
