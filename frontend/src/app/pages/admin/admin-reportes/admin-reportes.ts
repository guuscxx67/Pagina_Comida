import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api';

@Component({
  selector: 'app-admin-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-reportes.html',
  styleUrls: ['../admin.css']
})
export class AdminReportesComponent implements OnInit, OnChanges {
  @Input() adminId: string | null = null;

  private api = inject(ApiService);

  reportes: any = {
    resumen: { ingresos_totales: 0, total_pedidos: 0, ticket_promedio: 0 },
    ingresos_diarios: [],
    ingresos_mensuales: [],
    ingresos_por_categoria: [],
    ingresos_por_tipo: []
  };
  vistaActiva: 'diario' | 'mensual' = 'diario';

  ngOnInit() {
    this.cargarReportes();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['adminId'] && this.adminId) {
      this.cargarReportes();
    }
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
