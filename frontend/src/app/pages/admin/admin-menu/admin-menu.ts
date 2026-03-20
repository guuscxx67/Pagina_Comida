import { Component, Input, inject, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-admin-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-menu.html',
  styleUrls: ['../admin.css']
})
export class AdminMenuComponent implements OnInit {
  @Input() adminId: string | null = null;
  @Input() recetas: any[] = [];
  @Output() productoActualizado = new EventEmitter<void>();

  private api = inject(ApiService);
  private modal = inject(ModalService);

  readonly categoriasDisponibles = ['Menú del Día', 'Antojitos', 'Caldos y Sopas', 'Especialidades', 'Bebidas', 'Postres'];

  // Modal State
  modalVisible = false;
  selectedProductIds = new Set<string>();
  selectedCategory = '';
  productosDisponibles: any[] = [];

  ngOnInit() {
    this.actualizarProductosDisponibles();
  }

  ngOnChanges() {
    this.actualizarProductosDisponibles();
  }

  /**
   * Actualiza la lista de productos disponibles para seleccionar
   */
  private actualizarProductosDisponibles() {
    this.productosDisponibles = [...this.recetas];
  }

  /**
   * Computed property que retorna las categorías con sus productos
   */
  get menuCategorias() {
    const map = new Map<string, any[]>();
    
    // Inicializar todas las categorías
    for (const cat of this.categoriasDisponibles) {
      map.set(cat, []);
    }
    
    // Agregar productos a sus categorías
    for (const producto of this.recetas) {
      if (producto.categoria && map.has(producto.categoria)) {
        map.get(producto.categoria)!.push(producto);
      }
    }
    
    // Convertir a array de objetos con estructura {nombre, productos}
    return Array.from(map.entries()).map(([nombre, productos]) => ({
      nombre,
      productos
    }));
  }

  /**
   * Abre el modal para agregar productos
   */
  abrirModalAgregar() {
    this.modalVisible = true;
    this.selectedProductIds.clear();
    this.selectedCategory = '';
  }

  /**
   * Cierra el modal sin guardar cambios
   */
  cancelarModal() {
    this.modalVisible = false;
    this.selectedProductIds.clear();
    this.selectedCategory = '';
  }

  /**
   * Toggle a product in the selection set
   */
  toggleProducto(productoId: string) {
    if (this.selectedProductIds.has(productoId)) {
      this.selectedProductIds.delete(productoId);
    } else {
      this.selectedProductIds.add(productoId);
    }
  }

  /**
   * Verifica si un producto está seleccionado
   */
  isProductSelected(productoId: string): boolean {
    return this.selectedProductIds.has(productoId);
  }

  /**
   * Confirma y guarda el cambio de categoría para los productos seleccionados
   */
  confirmarAgregar() {
    if (!this.adminId || this.selectedProductIds.size === 0 || !this.selectedCategory) {
      this.modal.alerta('Selecciona al menos un producto y elige una categoría');
      return;
    }

    // Convertir Set a Array de IDs
    const productIds = Array.from(this.selectedProductIds);
    let actualizados = 0;
    let errores = 0;

    // Actualizar cada producto con la nueva categoría
    productIds.forEach(productoId => {
      const producto = this.recetas.find(r => r.id === productoId);
      if (!producto) {
        errores++;
        return;
      }

      // Llamar API para actualizar el producto
      this.api.actualizarReceta(this.adminId!, productoId, {
        ...producto,
        categoria: this.selectedCategory
      }).subscribe({
        next: () => {
          actualizados++;
          // Actualizar el objeto local
          producto.categoria = this.selectedCategory;
          
          // Si todos terminaron, mostrar mensaje de éxito
          if (actualizados + errores === productIds.length) {
            this.procesoCompletado(actualizados, errores);
          }
        },
        error: () => {
          errores++;
          if (actualizados + errores === productIds.length) {
            this.procesoCompletado(actualizados, errores);
          }
        }
      });
    });
  }

  /**
   * Maneja el resultado del proceso de actualización
   */
  private procesoCompletado(actualizados: number, errores: number) {
    if (errores === 0) {
      this.modal.exito(
        `${actualizados} producto${actualizados !== 1 ? 's' : ''} agregado${actualizados !== 1 ? 's' : ''} a ${this.selectedCategory}`
      );
    } else {
      this.modal.error(
        `Se actualizaron ${actualizados} correctamente. ${errores} error${errores !== 1 ? 's' : ''}.`
      );
    }
    this.productoActualizado.emit();
    this.cancelarModal();
  }

  /**
   * Elimina un producto de una categoría del menú
   */
  async eliminarProductoDeCategoria(productoId: string, categoria: string) {
    if (!this.adminId) return;

    const nombreProducto = this.recetas.find(r => r.id === productoId)?.nombre || 'Producto';
    const ok = await this.modal.confirmar(`¿Eliminar "${nombreProducto}" de ${categoria}?`);
    if (!ok) return;

    const producto = this.recetas.find(r => r.id === productoId);
    if (!producto) return;

    // Eliminar asignando categoría vacía o null
    this.api.actualizarReceta(this.adminId, productoId, {
      ...producto,
      categoria: ''
    }).subscribe({
      next: () => {
        this.modal.exito('Producto eliminado del menú');
        producto.categoria = '';
        this.productoActualizado.emit();
      },
      error: () => {
        this.modal.error('Error al eliminar el producto del menú');
      }
    });
  }
}
