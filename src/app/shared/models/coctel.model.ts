export interface Ingrediente {
  nombre_insumo: string;
  cantidad_por_persona: number;
  unidad_medida: 'ml' | 'pieza' | 'gramos' | 'hojas';
}

export interface Coctel {
  _id?: string;
  nombre: string;
  cristaleria: string;
  ingredientes: Ingrediente[];
}
