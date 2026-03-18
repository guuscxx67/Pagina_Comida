import { Component, Input, OnInit, OnChanges, inject, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-admin-recetas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-recetas.html',
  styleUrls: ['../admin.css']
})
export class AdminRecetasComponent implements OnInit, OnChanges {
  @Input() adminId: string | null = null;
  @Input() categoriaInicial: string | null = null;
  @Output() recetasActualizadas = new EventEmitter<any[]>();

  private api = inject(ApiService);
  private modal = inject(ModalService);

  recetas: any[] = [];
  formVisible = false;
  editandoId: string | null = null;
  form = { nombre: '', descripcion: '', precio: 0, categoria: 'General', disponible: true, imagen: '' };

  readonly categorias = ['Menu del Dia', 'Antojitos', 'Caldos y Sopas', 'Especialidades', 'Bebidas', 'Postres', 'General'];
  imagenesDisponibles: string[] = [];

  ngOnInit(): void {
    this.cargarRecetas();
    this.cargarImagenes();
  }

  ngOnChanges(): void {
    if (this.categoriaInicial) {
      this.abrirFormNuevoEnCategoria(this.categoriaInicial);
      this.categoriaInicial = null;
    }
  }

  cargarImagenes() {
    this.api.obtenerImagenes().subscribe({
      next: (res) => (this.imagenesDisponibles = res),
      error: () => console.error('No se pudieron cargar las imagenes')
    });
  }

  subirImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.adminId) return;
    this.api.subirImagen(this.adminId, input.files[0]).subscribe({
      next: (res: any) => {
        this.form.imagen = res.filename;
        this.cargarImagenes();
      },
      error: () => this.modal.error('Error al subir la imagen')
    });
    input.value = '';
  }

  cargarRecetas() {
    if (!this.adminId) return;
    this.api.obtenerRecetasAdmin(this.adminId).subscribe({
      next: (res: any) => {
        this.recetas = res;
        this.recetasActualizadas.emit(this.recetas);
      },
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
  }

  editarReceta(r: any) {
    this.editandoId = r.id;
    this.form = { nombre: r.nombre, descripcion: r.descripcion, precio: r.precio, categoria: r.categoria, disponible: r.disponible, imagen: r.imagen || '' };
    this.formVisible = true;
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
        if (err.status === 403) this.modal.error('Sesion expirada. Cierra sesion y vuelve a entrar.');
        else this.modal.error('Error al guardar la receta');
      }
    });
  }

  async eliminarReceta(id: string) {
    if (!this.adminId) return;
    const ok = await this.modal.confirmar('Eliminar esta receta?');
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

  imagenUrl(imagen: string): string {
    if (!imagen) return '';
    if (imagen.startsWith('http://') || imagen.startsWith('https://') || imagen.startsWith('/')) return imagen;
    return '/' + imagen;
  }
}
