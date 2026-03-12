import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { interval, Subscription } from 'rxjs';

interface Plato {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  precio: number;
  destacado?: boolean;
  categoria?: string;
  disponible?: boolean;
}

@Component({
  selector: 'app-gallery-showcase',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './gallery-showcase.html',
  styleUrls: ['./gallery-showcase.css'],
})
export class GalleryShowcaseComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private router = inject(Router);

  platos: Plato[] = [];
  cargando = true;
  error: string | null = null;
  private reloadSubscription: Subscription | null = null;

  // Modal state
  modalVisible = false;
  platoSeleccionado: Plato | null = null;

  ngOnInit() {
    this.cargarPlatos();
    // Recargar cada 30 segundos para ver cambios del admin en tiempo real
    this.reloadSubscription = interval(30000).subscribe(() => {
      this.cargarPlatos();
    });
  }

  ngOnDestroy() {
    if (this.reloadSubscription) {
      this.reloadSubscription.unsubscribe();
    }
  }

  /**
   * Cargar platos del backend (recetas)
   * Filtra solo los que tengan imagen y estén disponibles
   */
  cargarPlatos() {
    this.api.obtenerRecetas().subscribe({
      next: (data: any) => {
        // Filtrar recetas disponibles con imagen
        this.platos = (data || [])
          .filter((p: any) => p.disponible && p.imagen)
          .map((p: any, index: number) => ({
            id: p.id,
            nombre: p.nombre,
            descripcion: p.descripcion,
            imagen: p.imagen,
            precio: p.precio,
            categoria: p.categoria,
            disponible: p.disponible,
            destacado: index < 3 // Los primeros 3 son destacados
          }));
        this.cargando = false;
        this.error = null;
      },
      error: (err) => {
        console.error('Error al cargar platos:', err);
        this.error = 'Error al cargar los platos. Intenta recargar la página.';
        this.cargando = false;
      }
    });
  }

  scrollToSection(id: string) {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Abrir modal con detalles del plato
   */
  verDetalles(plato: Plato) {
    this.platoSeleccionado = plato;
    this.modalVisible = true;
  }

  /**
   * Cerrar modal de detalles
   */
  cerrarModal() {
    this.modalVisible = false;
    this.platoSeleccionado = null;
  }

  /**
   * Agregar plato al carrito y navegar a pedido
   */
  agregarAlCarrito(plato: Plato) {
    this.cerrarModal();
    // Guardar el plato seleccionado en localStorage para referencia
    localStorage.setItem('platoSeleccionado', JSON.stringify(plato));
    // Navegar a la página de pedido
    this.router.navigate(['/pedido/recoger']);
  }
}
