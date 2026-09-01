import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tipos-barra-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="list-container">
      <div class="header-actions" style="display:flex; justify-content:space-between; margin-bottom:1.5rem;">
        <h2>Tipos de Barra</h2>
        <a routerLink="nuevo" class="btn btn-primary" style="padding:0.5rem 1rem; background:#3498db; color:white; text-decoration:none; border-radius:4px;">+ Nuevo Tipo Barra</a>
      </div>
      <p>Listado de tipos de barra (Stub)</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TiposBarraListComponent {}
