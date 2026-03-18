import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, SlicePipe } from '@angular/common';
import { ApiService } from '../../../services/api';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, DatePipe, SlicePipe],
  templateUrl: './admin-pedidos.html',
  styleUrls: ['../admin.css']
})
export class AdminPedidosComponent implements OnInit {
  @Input() adminId: string | null = null;

  private api = inject(ApiService);
  private modal = inject(ModalService);

  pedidos: any[] = [];
  filtroTipo: 'todos' | 'reserva' | 'recogida' | 'domicilio' = 'todos';

  get pedidosFiltrados(): any[] {
    if (this.filtroTipo === 'todos') return this.pedidos;
    return this.pedidos.filter(p => p.tipo === this.filtroTipo);
  }

  get conteoReservas(): number { return this.pedidos.filter(p => p.tipo === 'reserva').length; }
  get conteoOrdenes(): number { return this.pedidos.filter(p => p.tipo === 'recogida').length; }
  get conteoEnvios(): number { return this.pedidos.filter(p => p.tipo === 'domicilio').length; }

  ngOnInit(): void {
    this.cargarPedidos();
  }

  cargarPedidos() {
    if (!this.adminId) return;
    this.api.obtenerPedidosAdmin(this.adminId).subscribe({
      next: (res: any) => (this.pedidos = res),
      error: (err) => {
        if (err.status === 403) this.modal.error('Sesion expirada. Cierra sesion y vuelve a entrar.');
        else this.modal.error('No se pudieron cargar pedidos');
      }
    });
  }

  cambiarEstado(pedidoId: string, estado: string) {
    if (!this.adminId) return;
    this.api.actualizarEstadoPedidoAdmin(this.adminId, pedidoId, estado).subscribe({
      next: () => this.cargarPedidos(),
      error: () => this.modal.error('No se pudo actualizar el estado')
    });
  }

  async eliminarPedido(id: string) {
    if (!this.adminId) return;
    const ok = await this.modal.confirmar('Eliminar este pedido? Esta accion no se puede deshacer.');
    if (!ok) return;
    this.api.eliminarPedidoAdmin(this.adminId, id).subscribe({
      next: () => this.cargarPedidos(),
      error: () => this.modal.error('Error al eliminar el pedido')
    });
  }
}
