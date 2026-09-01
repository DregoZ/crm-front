import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClientesService } from '../clientes.service';
import { Cliente } from '../../../shared/models/cliente.model';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.css'
})
export class ClienteFormComponent {
  private fb = inject(FormBuilder);
  private clientesService = inject(ClientesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  clienteId = this.route.snapshot.paramMap.get('id');
  isEdit = !!this.clienteId;

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    telefono: ['', Validators.required],
    email: ['', Validators.email],
    notas_gustos: ['']
  });

  constructor() {
    if (this.isEdit) {
      this.clientesService.getById(this.clienteId!).subscribe(cli => {
        this.form.patchValue(cli);
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    const req$ = this.isEdit 
      ? this.clientesService.update(this.clienteId!, this.form.value as Cliente)
      : this.clientesService.create(this.form.value as Cliente);

    req$.subscribe(() => {
      this.router.navigate(['/clientes']);
    });
  }
}
