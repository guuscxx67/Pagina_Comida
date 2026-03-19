import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['../admin.css']
})
export class AdminDashboardComponent implements OnInit, OnChanges {
  @Input() adminId: string | null = null;

  private api = inject(ApiService);

  dashboard: any = {
    ingresos_totales: 0,
    total_pedidos: 0,
    total_recetas: 0,
    recetas_disponibles: 0,
    total_usuarios: 0,
    pedidos_pendientes: 0,
    pedidos_confirmados: 0,
    pedidos_completados: 0,
    pedidos_cancelados: 0,
    pedidos_por_tipo: {},
    top_platos: [],
    ultimos_pedidos: []
  };

  reportes: any = {
    resumen: { ingresos_totales: 0, total_pedidos: 0, ticket_promedio: 0 },
    ingresos_diarios: [],
    ingresos_mensuales: [],
    ingresos_por_categoria: [],
    ingresos_por_tipo: []
  };
  vistaActiva: 'diario' | 'mensual' = 'diario';

  ngOnInit() {
    this.cargarDashboard();
    this.cargarReportes();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['adminId'] && this.adminId) {
      this.cargarDashboard();
      this.cargarReportes();
    }
  }

  cargarDashboard() {
    if (!this.adminId) return;
    this.api.obtenerDashboard(this.adminId).subscribe({
      next: (data) => {
        this.dashboard = data;
      },
      error: () => {}
    });
  }

  cargarReportes() {
    if (!this.adminId) return;
    this.api.obtenerReportes(this.adminId).subscribe({
      next: (data) => {
        this.reportes = data;
      },
      error: () => {}
    });
  }

  getEstadoClass(estado: string): string {
    return 'estado-' + estado;
  }

  getTipoLabel(tipo: string): string {
    const labels: any = { recogida: 'Recogida', reserva: 'Reserva', domicilio: 'Domicilio' };
    return labels[tipo] || tipo;
  }

  getEstadoLabel(estado: string): string {
    const labels: any = { pendiente: 'Pendiente', confirmado: 'Confirmado', completado: 'Completado', cancelado: 'Cancelado' };
    return labels[estado] || estado;
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  formatFechaDia(fecha: string): string {
    if (!fecha) return '';
    const parts = fecha.split('-');
    const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  }

  formatFechaMes(fecha: string): string {
    if (!fecha) return '';
    const parts = fecha.split('-');
    const d = new Date(+parts[0], +parts[1] - 1, 1);
    return d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  }

  getBarWidth(valor: number, lista: any[]): number {
    if (!lista || lista.length === 0) return 0;
    const max = Math.max(...lista.map((i: any) => i.ingresos));
    return max > 0 ? (valor / max) * 100 : 0;
  }
}
