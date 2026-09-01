import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { EventosService } from '../eventos.service';
import { ClientesService } from '../../clientes/clientes.service';
import { TiposBarraService } from '../../catalogo/tipos-barra/tipos-barra.service';

@Component({
  selector: 'app-evento-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './evento-form.component.html',
  styleUrl: './evento-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private eventosService = inject(EventosService);
  private clientesService = inject(ClientesService);
  private tiposBarraService = inject(TiposBarraService);
  private router = inject(Router);

  clientes = signal<any[]>([]);
  tiposBarra = signal<any[]>([]);

  form = this.fb.group({
    id_cliente: ['', Validators.required],
    id_tipo_barra: ['', Validators.required],
    fecha_evento: ['', Validators.required],
    direccion: ['', Validators.required],
    cantidad_asistentes: [50, [Validators.required, Validators.min(1)]],
    estado: ['Cotizado', Validators.required],
    logistica_notas: ['']
  });

  // Convertimos los values changes en señales para cálculos en vivo
  cantidadAsistentesSignal = toSignal(this.form.get('cantidad_asistentes')!.valueChanges, { initialValue: 50 });
  tipoBarraIdSignal = toSignal(this.form.get('id_tipo_barra')!.valueChanges, { initialValue: '' });

  precioFinalCalculado = computed(() => {
    const tId = this.tipoBarraIdSignal();
    const asis = this.cantidadAsistentesSignal();
    if (!tId || asis == null) return 0;
    const tb = this.tiposBarra().find(t => t._id === tId);
    if (!tb) return 0;
    return tb.precio_base_persona * asis;
  });

  ngOnInit() {
    this.clientesService.getAll(1, 100).subscribe(res => this.clientes.set(res.data));
    // Simulamos la carga de Tipos de Barra para el cálculo
    this.tiposBarraService.getAll().subscribe(tb => this.tiposBarra.set(tb));
  }

  onSubmit() {
    if (this.form.invalid) return;
    const data = { 
      ...this.form.value,
      precio_final_calculado: this.precioFinalCalculado()
    };
    this.eventosService.create(data as any).subscribe(() => {
      this.router.navigate(['/eventos']);
    });
  }
}
