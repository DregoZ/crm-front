import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from './dashboard.service';
import { MetricasDashboard, AlertaDashboard } from '../../shared/models/dashboard.model';
import { Evento } from '../../shared/models/evento.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);

  metricas = signal<MetricasDashboard | null>(null);
  proximosEventos = signal<Evento[]>([]);
  alertas = signal<AlertaDashboard[]>([]);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    this.dashboardService.getResumen().subscribe({
      next: (res) => {
        this.metricas.set(res.metricas);
        this.proximosEventos.set(res.proximosEventos);
        this.alertas.set(res.alertas);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
