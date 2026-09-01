import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CoctelesService } from '../cocteles.service';

@Component({
  selector: 'app-coctel-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './coctel-form.component.html',
  styleUrl: './coctel-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoctelFormComponent {
  private fb = inject(FormBuilder);
  private coctelesService = inject(CoctelesService);
  private router = inject(Router);

  form = this.fb.group({
    nombre: ['', Validators.required],
    cristaleria: ['', Validators.required],
    ingredientes: this.fb.array([], Validators.required) // FormArray dinámico
  });

  get ingredientes() {
    return this.form.get('ingredientes') as FormArray;
  }

  addIngrediente() {
    const ingredienteForm = this.fb.group({
      nombre_insumo: ['', Validators.required],
      cantidad_por_persona: [0, [Validators.required, Validators.min(1)]],
      unidad_medida: ['ml', Validators.required]
    });
    this.ingredientes.push(ingredienteForm);
  }

  removeIngrediente(index: number) {
    this.ingredientes.removeAt(index);
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.coctelesService.create(this.form.value as any).subscribe(() => {
      this.router.navigate(['/catalogo/cocteles']);
    });
  }
}
