import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../../../../shared/models/components/button/button.component';
import { CoctelesService } from '../cocteles.service';
import { Coctel } from '../../../../shared/models/coctel.model';
import {
  CRISTALERIA_OPTIONS,
  UNIDADES_MEDIDA_OPTIONS,
} from '../../../../shared/constants/cristaleria.constant';

@Component({
  selector: 'app-coctel-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    ButtonComponent,
  ],
  templateUrl: './coctel-form.component.html',
  styleUrl: './coctel-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoctelFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private coctelesService = inject(CoctelesService);
  private dialogRef = inject(MatDialogRef<CoctelFormComponent>, {
    optional: true,
  });
  data = inject<{ coctel?: Coctel }>(MAT_DIALOG_DATA, { optional: true });

  cristaleriaOptions = CRISTALERIA_OPTIONS;
  unidadesMedidaOptions = UNIDADES_MEDIDA_OPTIONS;

  saving = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    cristaleria: ['', Validators.required],
    ingredientes: this.fb.array([], Validators.required),
  });

  get isEdit(): boolean {
    return Boolean(this.data?.coctel?._id);
  }

  get ingredientes(): FormArray {
    return this.form.get('ingredientes') as FormArray;
  }

  ngOnInit() {
    if (this.data?.coctel) {
      const c = this.data.coctel;
      this.form.patchValue({
        nombre: c.nombre,
        cristaleria: c.cristaleria || (c as any).tipo_vaso?.nombre || '',
      });

      if (c.ingredientes && c.ingredientes.length > 0) {
        c.ingredientes.forEach((ing) => this.addIngrediente(ing));
      } else {
        this.addIngrediente();
      }
    } else {
      // Iniciar con un ingrediente por defecto
      this.addIngrediente();
    }
  }

  addIngrediente(init?: {
    nombre_insumo?: string;
    cantidad_por_persona?: number;
    unidad_medida?: 'ml' | 'pieza' | 'gramos' | 'hojas';
  }) {
    const ingredienteForm = this.fb.group({
      nombre_insumo: [
        init?.nombre_insumo || '',
        [Validators.required, Validators.maxLength(100)],
      ],
      cantidad_por_persona: [
        init?.cantidad_por_persona ?? 30,
        [Validators.required, Validators.min(0.1)],
      ],
      unidad_medida: [init?.unidad_medida || 'ml', Validators.required],
    });
    this.ingredientes.push(ingredienteForm);
  }

  removeIngrediente(index: number) {
    this.ingredientes.removeAt(index);
  }

  close() {
    this.dialogRef?.close();
  }

  onSubmit() {
    if (this.form.invalid || this.ingredientes.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const val = this.form.value;
    const payload = {
      nombre: val.nombre!,
      cristaleria: val.cristaleria!,
      ingredientes: val.ingredientes as any,
    };

    const request$ = this.isEdit
      ? this.coctelesService.update(this.data!.coctel!._id!, payload)
      : this.coctelesService.create(payload);

    request$.subscribe({
      next: (res) => {
        this.saving.set(false);
        this.dialogRef?.close(res);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMessage.set(
          err?.error?.error || 'Error al guardar el cóctel. Inténtalo de nuevo.',
        );
      },
    });
  }
}
