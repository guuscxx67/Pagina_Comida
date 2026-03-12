import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  pedidos: any[] = [];
  recetas: any[] = [];
  adminId: string | null = null;
  activeTab: 'pedidos' | 'recetas' | 'menu' = 'recetas';

  // Formulario receta
  formVisible = false;
  editandoId: string | null = null;
  form = { nombre: '', descripcion: '', precio: 0, categoria: 'General', disponible: true, imagen: '' };

  readonly categorias = ['Menú del Día', 'Antojitos', 'Caldos y Sopas', 'Especialidades', 'Bebidas', 'Postres', 'General'];

  get menuCategorias() {
    const map = new Map<string, any[]>();
    for (const cat of this.categorias) map.set(cat, []);
    for (const r of this.recetas) {
      if (!map.has(r.categoria)) map.set(r.categoria, []);
      map.get(r.categoria)!.push(r);
    }
    return Array.from(map.entries()).map(([nombre, recetas]) => ({ nombre, recetas }));
  }

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
    this.cargarRecetas();
  }

  // ── PEDIDOS ─────────────────────────────────────────────
  cargarPedidos() {
    if (!this.adminId) return;
    this.api.obtenerPedidosAdmin(this.adminId).subscribe({
      next: (res: any) => (this.pedidos = res),
      error: (err) => {
        if (err.status === 403) alert('Sesión expirada. Cierra sesión y vuelve a entrar.');
        else alert('No se pudieron cargar pedidos');
      }
    });
  }

  cambiarEstado(pedidoId: string, estado: string) {
    if (!this.adminId) return;
    this.api.actualizarEstadoPedidoAdmin(this.adminId, pedidoId, estado).subscribe({
      next: () => this.cargarPedidos(),
      error: () => alert('No se pudo actualizar el estado')
    });
  }

  // ── RECETAS ──────────────────────────────────────────────
  cargarRecetas() {
    if (!this.adminId) return;
    this.api.obtenerRecetasAdmin(this.adminId).subscribe({
      next: (res: any) => (this.recetas = res),
      error: (err) => {
        if (err.status === 403) alert('Sesión expirada. Cierra sesión y vuelve a entrar.');
        else alert('No se pudieron cargar las recetas');
      }
    });
  }

  abrirFormNuevo() {
    this.editandoId = null;
    this.form = { nombre: '', descripcion: '', precio: 0, categoria: 'General', disponible: true, imagen: '' };
    this.formVisible = true;
  }

  abrirFormNuevoEnCategoria(categoria: string) {
    this.editandoId = null;
    this.form = { nombre: '', descripcion: '', precio: 0, categoria, disponible: true, imagen: '' };
    this.formVisible = true;
    this.activeTab = 'recetas';
  }

  editarReceta(r: any) {
    this.editandoId = r.id;
    this.form = { nombre: r.nombre, descripcion: r.descripcion, precio: r.precio, categoria: r.categoria, disponible: r.disponible, imagen: r.imagen || '' };
    this.formVisible = true;
    this.activeTab = 'recetas';
  }

  guardarReceta() {
    if (!this.adminId) return;
    if (!this.form.nombre.trim() || this.form.precio <= 0) {
      alert('Nombre y precio son obligatorios y precio debe ser mayor a 0');
      return;
    }

    const accion = this.editandoId
      ? this.api.actualizarReceta(this.adminId, this.editandoId, this.form)
      : this.api.crearReceta(this.adminId, this.form);

    accion.subscribe({
      next: () => {
        this.formVisible = false;
        this.cargarRecetas();
      },
      error: (err) => {
        console.error('Error:', err);
        if (err.status === 403) alert('Sesión expirada. Cierra sesión y vuelve a entrar.');
        else alert('Error al guardar la receta');
      }
    });
  }

  eliminarReceta(id: string) {
    if (!this.adminId) return;
    if (!confirm('¿Eliminar esta receta?')) return;
    this.api.eliminarReceta(this.adminId, id).subscribe({
      next: () => this.cargarRecetas(),
      error: () => alert('Error al eliminar la receta')
    });
  }

  toggleDisponible(r: any) {
    if (!this.adminId) return;
    this.api.actualizarReceta(this.adminId, r.id, { disponible: !r.disponible }).subscribe({
      next: () => this.cargarRecetas(),
      error: () => alert('Error al actualizar disponibilidad')
    });
  }

  cancelarForm() {
    this.formVisible = false;
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/register']);
  }
}
