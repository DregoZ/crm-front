import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'info'
  | 'warning'
  | 'danger'
  | 'success';
export type ButtonSize = 'sm' | 'md';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
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

  get cssClasses(): string {
    return `btn btn-${this.variant()}${this.size() === 'sm' ? ' btn-sm' : ''}`;
  }

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
