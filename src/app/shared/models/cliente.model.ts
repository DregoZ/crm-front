export interface Cliente {
  _id?: string;
  nombre: string;
  telefono: string;
  email?: string;
  notas_gustos?: string;
  fecha_registro?: Date;
  activo?: boolean;
}
