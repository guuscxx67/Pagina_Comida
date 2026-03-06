import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  pedidos: any[] = [];
  adminId: number | null = null;

  ngOnInit(): void {
    const user = localStorage.getItem('usuario');
    if (!user) {
      this.router.navigate(['/register']);
      return;
    }

    const u = JSON.parse(user);
    if (!u.es_admin) {
      this.router.navigate(['/home']);
      return;
    }

    this.adminId = u.id;
    this.cargarPedidos();
  }

  cargarPedidos() {
    if (!this.adminId) return;
    this.api.obtenerPedidosAdmin(this.adminId).subscribe({
      next: (res: any) => (this.pedidos = res),
      error: () => alert('No se pudieron cargar pedidos')
    });
  }

  cambiarEstado(pedidoId: number, estado: string) {
    if (!this.adminId) return;
    this.api.actualizarEstadoPedidoAdmin(this.adminId, pedidoId, estado).subscribe({
      next: () => this.cargarPedidos(),
      error: () => alert('No se pudo actualizar el estado')
    });
  }
}
