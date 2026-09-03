import { ButtonVariant } from './components/button/button.component';

export interface TableButtonConfig {
  variant?: ButtonVariant;
  icon?: string;
  label?: string;
  routerLink?: string | any[];
  disabled?: boolean;
  onClick?: () => void;
}
