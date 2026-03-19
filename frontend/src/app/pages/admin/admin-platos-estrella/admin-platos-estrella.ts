import { Component, Input, OnInit, inject, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-admin-platos-estrella',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-platos-estrella.html',
  styleUrls: ['../admin.css']
})
export class AdminPlatosEstrellaComponent implements OnInit {
  @Input() adminId: string | null = null;
  @Output() platosActualizados = new EventEmitter<any[]>();

  private api = inject(ApiService);
  private modal = inject(ModalService);

  platosEstrella: any[] = [];
  recetasDisponibles: any[] = [];
  formVisible = false;
  editandoId: string | null = null;
  recetaSeleccionadaId: string = '';
  formOrden: number = 1;

  ngOnInit(): void {
    this.cargarPlatosEstrella();
    this.cargarRecetas();
  }

  cargarRecetas() {
    if (!this.adminId) return;
    this.api.obtenerRecetasAdmin(this.adminId).subscribe({
      next: (res: any) => (this.recetasDisponibles = res),
      error: () => console.error('No se pudieron cargar las recetas')
    });
  }

  cargarPlatosEstrella() {
    if (!this.adminId) return;
    this.api.obtenerPlatosEstrellaAdmin(this.adminId).subscribe({
      next: (res: any) => {
        this.platosEstrella = res;
        this.platosActualizados.emit(res);
      },
      error: (err) => {
        if (err.status === 403) this.modal.error('Sesion expirada. Cierra sesion y vuelve a entrar.');
        else this.modal.error('No se pudieron cargar los platos estrella');
      }
    });
  }

  abrirFormNuevo() {
    this.editandoId = null;
    this.recetaSeleccionadaId = '';
    this.formOrden = this.platosEstrella.length + 1;
    this.formVisible = true;
  }

  get recetaSeleccionada(): any | null {
    if (!this.recetaSeleccionadaId) return null;
    return this.recetasDisponibles.find(r => r.id === this.recetaSeleccionadaId) || null;
  }

  guardarPlatoEstrella() {
    if (!this.adminId) return;

    if (this.editandoId) {
      const accion = this.api.actualizarPlatoEstrella(this.adminId, this.editandoId, { orden: this.formOrden });
      accion.subscribe({
        next: () => {
          this.formVisible = false;
          this.cargarPlatosEstrella();
        },
        error: (err) => {
          if (err.status === 403) this.modal.error('Sesion expirada. Cierra sesion y vuelve a entrar.');
          else this.modal.error('Error al guardar el plato estrella');
        }
      });
      return;
    }

    const receta = this.recetaSeleccionada;
    if (!receta) {
      this.modal.alerta('Selecciona una receta para agregar como plato estrella');
      return;
    }

    const plato = {
      nombre: receta.nombre,
      descripcion: receta.descripcion,
      precio: receta.precio,
      imagen: receta.imagen || '',
      orden: this.formOrden
    };

    this.api.crearPlatoEstrella(this.adminId, plato).subscribe({
      next: () => {
        this.formVisible = false;
        this.cargarPlatosEstrella();
      },
      error: (err) => {
        if (err.status === 403) this.modal.error('Sesion expirada. Cierra sesion y vuelve a entrar.');
        else this.modal.error('Error al guardar el plato estrella');
      }
    });
  }

  editarPlatoEstrella(p: any) {
    this.editandoId = p.id;
    this.formOrden = p.orden;
    this.formVisible = true;
  }

  async eliminarPlatoEstrella(id: string) {
    if (!this.adminId) return;
    const ok = await this.modal.confirmar('Eliminar este plato estrella?');
    if (!ok) return;
    this.api.eliminarPlatoEstrella(this.adminId, id).subscribe({
      next: () => this.cargarPlatosEstrella(),
      error: () => this.modal.error('Error al eliminar el plato estrella')
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
