import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { ModalService } from '../../services/modal.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private modal = inject(ModalService);

  pedidos: any[] = [];
  recetas: any[] = [];
  adminId: string | null = null;
  activeTab: 'pedidos' | 'recetas' | 'menu' | 'platos-estrella' = 'recetas';

  formVisible = false;
  editandoId: string | null = null;
  form = { nombre: '', descripcion: '', precio: 0, categoria: 'General', disponible: true, imagen: '' };

  platosEstrella: any[] = [];
  formEstrellaVisible = false;
  editandoEstrellaId: string | null = null;
  formEstrella = { nombre: '', descripcion: '', precio: 0, imagen: '', orden: 0 };

  readonly categorias = ['Menú del Día', 'Antojitos', 'Caldos y Sopas', 'Especialidades', 'Bebidas', 'Postres', 'General'];

  imagenesDisponibles: string[] = [];

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
    this.cargarPlatosEstrella();
    this.cargarImagenes();
  }

  cargarImagenes() {
    this.api.obtenerImagenes().subscribe({
      next: (res) => (this.imagenesDisponibles = res),
      error: () => console.error('No se pudieron cargar las imágenes')
    });
  }

  subirImagen(event: Event, target: 'receta' | 'estrella') {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.adminId) return;
    const archivo = input.files[0];
    this.api.subirImagen(this.adminId, archivo).subscribe({
      next: (res: any) => {
        const filename = res.filename;
        if (target === 'receta') {
          this.form.imagen = filename;
        } else {
          this.formEstrella.imagen = filename;
        }
        this.cargarImagenes();
      },
      error: () => this.modal.error('Error al subir la imagen')
    });
    input.value = '';
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

  cargarRecetas() {
    if (!this.adminId) return;
    this.api.obtenerRecetasAdmin(this.adminId).subscribe({
      next: (res: any) => (this.recetas = res),
      error: (err) => {
        if (err.status === 403) this.modal.error('Sesion expirada. Cierra sesion y vuelve a entrar.');
        else this.modal.error('No se pudieron cargar las recetas');
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
      this.modal.alerta('Nombre y precio son obligatorios y precio debe ser mayor a 0');
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
        if (err.status === 403) this.modal.error('Sesion expirada. Cierra sesion y vuelve a entrar.');
        else this.modal.error('Error al guardar la receta');
      }
    });
  }

  async eliminarReceta(id: string) {
    if (!this.adminId) return;
    const ok = await this.modal.confirmar('¿Eliminar esta receta?');
    if (!ok) return;
    this.api.eliminarReceta(this.adminId, id).subscribe({
      next: () => this.cargarRecetas(),
      error: () => this.modal.error('Error al eliminar la receta')
    });
  }

  toggleDisponible(r: any) {
    if (!this.adminId) return;
    this.api.actualizarReceta(this.adminId, r.id, { disponible: !r.disponible }).subscribe({
      next: () => this.cargarRecetas(),
      error: () => this.modal.error('Error al actualizar disponibilidad')
    });
  }

  cancelarForm() {
    this.formVisible = false;
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/register']);
  }

  // ── Platos Estrella ──

  cargarPlatosEstrella() {
    if (!this.adminId) return;
    this.api.obtenerPlatosEstrellaAdmin(this.adminId).subscribe({
      next: (res: any) => (this.platosEstrella = res),
      error: (err) => {
        if (err.status === 403) this.modal.error('Sesion expirada. Cierra sesion y vuelve a entrar.');
        else this.modal.error('No se pudieron cargar los platos estrella');
      }
    });
  }

  abrirFormEstrellaNuevo() {
    this.editandoEstrellaId = null;
    this.formEstrella = { nombre: '', descripcion: '', precio: 0, imagen: '', orden: this.platosEstrella.length + 1 };
    this.formEstrellaVisible = true;
  }

  editarPlatoEstrella(p: any) {
    this.editandoEstrellaId = p.id;
    this.formEstrella = { nombre: p.nombre, descripcion: p.descripcion, precio: p.precio, imagen: p.imagen || '', orden: p.orden };
    this.formEstrellaVisible = true;
  }

  guardarPlatoEstrella() {
    if (!this.adminId) return;
    if (!this.formEstrella.nombre.trim() || this.formEstrella.precio <= 0) {
      this.modal.alerta('Nombre y precio son obligatorios y precio debe ser mayor a 0');
      return;
    }

    const accion = this.editandoEstrellaId
      ? this.api.actualizarPlatoEstrella(this.adminId, this.editandoEstrellaId, this.formEstrella)
      : this.api.crearPlatoEstrella(this.adminId, this.formEstrella);

    accion.subscribe({
      next: () => {
        this.formEstrellaVisible = false;
        this.cargarPlatosEstrella();
      },
      error: (err) => {
        console.error('Error:', err);
        if (err.status === 403) this.modal.error('Sesion expirada. Cierra sesion y vuelve a entrar.');
        else this.modal.error('Error al guardar el plato estrella');
      }
    });
  }

  async eliminarPlatoEstrella(id: string) {
    if (!this.adminId) return;
    const ok = await this.modal.confirmar('¿Eliminar este plato estrella?');
    if (!ok) return;
    this.api.eliminarPlatoEstrella(this.adminId, id).subscribe({
      next: () => this.cargarPlatosEstrella(),
      error: () => this.modal.error('Error al eliminar el plato estrella')
    });
  }

  cancelarFormEstrella() {
    this.formEstrellaVisible = false;
  }

  imagenUrl(imagen: string): string {
    if (!imagen) return '';
    if (imagen.startsWith('http://') || imagen.startsWith('https://') || imagen.startsWith('/')) return imagen;
    return '/' + imagen;
  }
}
