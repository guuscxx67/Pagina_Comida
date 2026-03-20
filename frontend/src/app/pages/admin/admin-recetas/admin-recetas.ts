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
  platosEstrella: any[] = [];
  formVisible = false;
  editandoId: string | null = null;
  form = { nombre: '', descripcion: '', precio: 0, categoria: 'General', disponible: true, imagen: '' };

  readonly categorias = ['Menu del Dia', 'Antojitos', 'Caldos y Sopas', 'Especialidades', 'Bebidas', 'Postres', 'General'];
  imagenesDisponibles: string[] = [];

  ngOnInit(): void {
    this.cargarRecetas();
    this.cargarPlatosEstrella();
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

  cargarPlatosEstrella() {
    if (!this.adminId) return;
    this.api.obtenerPlatosEstrellaAdmin(this.adminId).subscribe({
      next: (res: any) => {
        this.platosEstrella = res;
      },
      error: () => console.error('Error cargando platos estrella')
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
    
    // Validaciones
    if (!this.form.nombre.trim()) {
      this.modal.alerta('El nombre del producto es obligatorio');
      return;
    }
    
    if (this.form.precio <= 0) {
      this.modal.alerta('El precio debe ser mayor a 0');
      return;
    }

    const accion = this.editandoId
      ? this.api.actualizarReceta(this.adminId, this.editandoId, this.form)
      : this.api.crearReceta(this.adminId, this.form);

    accion.subscribe({
      next: () => {
        this.modal.exito(this.editandoId ? 'Producto actualizado' : 'Producto creado');
        this.formVisible = false;
        this.cargarRecetas();
      },
      error: (err) => {
        if (err.status === 403) this.modal.error('Sesión expirada. Cierra sesión y vuelve a entrar.');
        else this.modal.error('Error al guardar la receta');
      }
    });
  }

  cancelarForm() {
    this.formVisible = false;
  }

  cerrarModal(event: MouseEvent) {
    // Cierra el modal solo si se hace clic fuera del contenido
    if (event.target === event.currentTarget) {
      this.cancelarForm();
    }
  }

  esPlatoEstrella(recetaId: string): boolean {
    return this.platosEstrella.some((p: any) => {
      // Suponiendo que el plato estrella tiene una referencia al ID de la receta
      // o que el nombre coincide
      return p.receta_id === recetaId || p.nombre === this.recetas.find(r => r.id === recetaId)?.nombre;
    });
  }

  togglePlatoEstrella(receta: any) {
    if (!this.adminId) return;

    const esEstrella = this.esPlatoEstrella(receta.id);

    if (esEstrella) {
      // Eliminar de platos estrella
      const platoEstrella = this.platosEstrella.find((p: any) => 
        p.receta_id === receta.id || p.nombre === receta.nombre
      );
      
      if (platoEstrella) {
        // Actualización optimista: eliminar inmediatamente
        this.platosEstrella = this.platosEstrella.filter((p: any) => p.id !== platoEstrella.id);
        
        this.api.eliminarPlatoEstrella(this.adminId, platoEstrella.id).subscribe({
          next: () => {
            // Ya está eliminado visualmente
          },
          error: () => {
            // Si falla, recargar para sincronizar
            this.cargarPlatosEstrella();
            this.modal.error('Error al eliminar de platos estrella');
          }
        });
      }
    } else {
      // Agregar a platos estrella
      const plato = {
        nombre: receta.nombre,
        descripcion: receta.descripcion,
        precio: receta.precio,
        imagen: receta.imagen || '',
        orden: this.platosEstrella.length + 1
      };

      this.api.crearPlatoEstrella(this.adminId, plato).subscribe({
        next: (res: any) => {
          // Agregar con el ID que retorna el servidor
          this.platosEstrella.push({
            id: res.id || res,
            ...plato
          });
        },
        error: () => {
          // Si falla, recargar para sincronizar
          this.cargarPlatosEstrella();
          this.modal.error('Error al agregar a platos estrella');
        }
      });
    }
  }

  async eliminarReceta(id: string) {
    if (!this.adminId) return;
    const ok = await this.modal.confirmar('¿Estás seguro de que deseas eliminar este producto?');
    if (!ok) return;
    this.api.eliminarReceta(this.adminId, id).subscribe({
      next: () => {
        this.modal.exito('Producto eliminado');
        this.cargarRecetas();
      },
      error: () => this.modal.error('Error al eliminar el producto')
    });
  }

  toggleDisponible(r: any) {
    if (!this.adminId) return;
    this.api.actualizarReceta(this.adminId, r.id, { disponible: !r.disponible }).subscribe({
      next: () => {
        this.cargarRecetas();
      },
      error: () => this.modal.error('Error al actualizar disponibilidad')
    });
  }

  imagenUrl(imagen: string): string {
    if (!imagen) return '';
    if (imagen.startsWith('http://') || imagen.startsWith('https://') || imagen.startsWith('/')) return imagen;
    return '/' + imagen;
  }
}
