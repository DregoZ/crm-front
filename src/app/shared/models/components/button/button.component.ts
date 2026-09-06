import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'info'
  | 'warning'
  | 'danger'
  | 'success'
  | 'primary-outlined'
  | 'secondary-outlined'
  | 'info-outlined'
  | 'warning-outlined'
  | 'danger-outlined'
  | 'success-outlined';

export type ButtonSize = 'sm' | 'md';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  icon = input<string>(); // opcional
  label = input<string>(); // opcional
  routerLink = input<string | any[]>(); // opcional → si existe, renderiza <a>
  disabled = input(false);
  title = input<string>(); // tooltip, útil si solo hay icono

  clicked = output<void>();

  /** true si la variante termina en '-outlined' */
  isOutlined = computed(() => this.variant().includes('outlined'));

  /** true si es variante 'success' (necesita CSS personalizado) */
  isSuccess = computed(() => this.variant().replace('-outlined', '') === 'success');

  /** Color de Angular Material: primary | warn | accent | undefined */
  matColor = computed((): 'primary' | 'accent' | 'warn' | undefined => {
    const base = this.variant().replace('-outlined', '');
    if (base === 'primary' || base === 'info') return 'primary';
    if (base === 'danger' || base === 'warning') return 'warn';
    if (base === 'secondary') return 'accent';
    return undefined; // success: manejado con CSS
  });

  get effectiveTitle(): string | null {
    return this.title() ?? this.label() ?? null;
  }

  ngOnInit() {
    if (!this.icon() && !this.label()) {
      console.warn('[app-button] Debes especificar al menos "icon" o "label".');
    }
  }

  onClick() {
    if (!this.disabled()) this.clicked.emit();
  }
}
