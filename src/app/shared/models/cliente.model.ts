export interface Cliente {
  _id?: string;
  nombre: string;
  telefono: string;
  email?: string;
  notas_gustos?: string;
  fecha_registro?: Date;
  activo?: boolean;
}

export interface ClienteCompleto extends Cliente {
  proximoEvento?: { fecha_evento: string; estado: string } | null;
  totalEventos: number;
}
