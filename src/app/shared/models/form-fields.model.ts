import { ModalSize } from './components/modal-form/modal-config.model';
import { ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'date'
  | 'select'
  | 'switch'
  | 'button';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface FormFieldConfig {
  onClick?: () => void;
  id: string;
  type: FieldType;
  label?: string;
  value?: any; // string | number | Date | boolean | (string|number)
  size?: number; // % de ancho, default 100
  editable?: boolean; // default true
  required?: boolean;
  options?: SelectOption[]; // solo para type: 'select'
  placeholder?: string;
  maxLength?: number; // Límite de caracteres (default 128 para text)
  rows?: number; // Número de filas para 'textarea' (default 3)
  extraValidators?: ValidatorFn[];
  currencySymbol?: string; // default '€'
}

export interface FormModalData {
  title: string;
  fields: FormFieldConfig[];
  onSave: (values: Record<string, any>) => Observable<any>;
  /** Optional modal size token */
  size?: ModalSize;
}
