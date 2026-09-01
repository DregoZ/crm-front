export interface MetricasDashboard {
  eventosConfirmadosMes: number;
  facturacionProyectada: number;
  presupuestosPendientes: number;
}

export interface AlertaDashboard {
  id: string;
  mensaje: string;
  tipo: 'warning' | 'error' | 'info';
  fecha?: Date;
}
