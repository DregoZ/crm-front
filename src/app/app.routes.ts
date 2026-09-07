import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/clientes/clientes-list/clientes-list.component').then(
            (m) => m.ClientesListComponent,
          ),
      },

      {
        path: 'eventos',
        loadComponent: () =>
          import('./features/eventos/eventos-list/eventos-list.component').then(
            (m) => m.EventosListComponent,
          ),
      },

      {
        path: 'catalogo/cocteles',
        loadComponent: () =>
          import('./features/catalogo/cocteles/cocteles-list/cocteles-list.component').then(
            (m) => m.CoctelesListComponent,
          ),
      },

      {
        path: 'catalogo/tipos-barra',
        loadComponent: () =>
          import('./features/catalogo/tipos-barra/tipos-barra-list/tipos-barra-list.component').then(
            (m) => m.TiposBarraListComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
