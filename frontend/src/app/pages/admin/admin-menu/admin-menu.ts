import { Component, Input, inject, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-admin-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-menu.html',
  styleUrls: ['../admin.css']
})
export class AdminMenuComponent {
  @Input() adminId: string | null = null;
  @Input() recetas: any[] = [];
  @Output() agregarEnCategoria = new EventEmitter<string>();
  @Output() editarReceta = new EventEmitter<any>();
  @Output() recetaEliminada = new EventEmitter<void>();

  private api = inject(ApiService);
  private modal = inject(ModalService);

  readonly categorias = ['Menu del Dia', 'Antojitos', 'Caldos y Sopas', 'Especialidades', 'Bebidas', 'Postres', 'General'];

  get menuCategorias() {
    const map = new Map<string, any[]>();
    for (const cat of this.categorias) map.set(cat, []);
    for (const r of this.recetas) {
      if (!map.has(r.categoria)) map.set(r.categoria, []);
      map.get(r.categoria)!.push(r);
    }
    return Array.from(map.entries()).map(([nombre, recetas]) => ({ nombre, recetas }));
  }

  onAgregarPlatillo(categoria: string) {
    this.agregarEnCategoria.emit(categoria);
  }

  onEditarReceta(r: any) {
    this.editarReceta.emit(r);
  }

  async eliminarReceta(id: string) {
    if (!this.adminId) return;
    const ok = await this.modal.confirmar('Eliminar esta receta?');
    if (!ok) return;
    this.api.eliminarReceta(this.adminId, id).subscribe({
      next: () => this.recetaEliminada.emit(),
      error: () => this.modal.error('Error al eliminar la receta')
    });
  }

  imagenUrl(imagen: string): string {
    if (!imagen) return '';
    if (imagen.startsWith('http://') || imagen.startsWith('https://') || imagen.startsWith('/')) return imagen;
    return '/' + imagen;
  }
}
