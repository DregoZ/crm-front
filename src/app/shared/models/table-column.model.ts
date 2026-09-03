export type ColumnType =
  | 'string'
  | 'number'
  | 'date'
  | 'icon'
  | 'boolean'
  | 'currency'
  | 'custom';

export interface TableColumn<T = any> {
  name: (keyof T & string) | string; // clave del dato, ej. 'nombre'
  label: string; // texto del header, ej. 'Nombre'
  type: ColumnType;
  sortable?: boolean; // default true
  size?: number; // % de ancho de la tabla, ej. 20
  format?: string; // ej. 'shortDate', 'dd/MM/yyyy' (para type 'date')
  accessor?: (row: T) => any; // ← nuevo: para valores anidados o calculados
}

export interface TableAction<T = any> {
  icon?: string;
  label: string;
  cssClass?: string;
  handler: (row: T) => void;
  visible?: (row: T) => boolean; // oculta la acción condicionalmente si hace falta
}
