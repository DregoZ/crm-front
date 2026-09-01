import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cocteles-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="list-container">
      <div class="header-actions" style="display:flex; justify-content:space-between; margin-bottom:1.5rem;">
        <h2>Cócteles</h2>
        <a routerLink="nuevo" class="btn btn-primary" style="padding:0.5rem 1rem; background:#3498db; color:white; text-decoration:none; border-radius:4px;">+ Nuevo Cóctel</a>
      </div>
      <p>Listado de cócteles (Stub)</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CoctelesListComponent {}
