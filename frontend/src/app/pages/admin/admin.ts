import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AdminRecetasComponent } from './admin-recetas/admin-recetas';
import { AdminMenuComponent } from './admin-menu/admin-menu';
import { AdminPedidosComponent } from './admin-pedidos/admin-pedidos';
import { AdminPlatosEstrellaComponent } from './admin-platos-estrella/admin-platos-estrella';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminRecetasComponent, AdminMenuComponent, AdminPedidosComponent, AdminPlatosEstrellaComponent],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit {
  private router = inject(Router);

  adminId: string | null = null;
  activeTab: 'recetas' | 'menu' | 'pedidos' | 'platos-estrella' = 'recetas';
  recetas: any[] = [];

  @ViewChild(AdminRecetasComponent) recetasComp?: AdminRecetasComponent;

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
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/register']);
  }

  onRecetasActualizadas(recetas: any[]) {
    this.recetas = recetas;
  }

  onAgregarEnCategoria(categoria: string) {
    this.activeTab = 'recetas';
    setTimeout(() => {
      this.recetasComp?.abrirFormNuevoEnCategoria(categoria);
    });
  }

  onEditarReceta(r: any) {
    this.activeTab = 'recetas';
    setTimeout(() => {
      this.recetasComp?.editarReceta(r);
    });
  }

  onRecetaEliminada() {
    this.recetasComp?.cargarRecetas();
  }

  onPlatosActualizados() {
    this.recetasComp?.cargarPlatosEstrella();
  }
}
