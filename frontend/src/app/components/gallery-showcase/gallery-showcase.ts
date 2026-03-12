import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule],
  templateUrl: './gallery-showcase.html',
  styleUrls: ['./gallery-showcase.css'],
})
export class GalleryShowcaseComponent implements OnInit, OnDestroy {
  platos: Plato[] = [];
  cargando = true;
  error: string | null = null;
  private reloadSubscription: Subscription | null = null;

  constructor(private api: ApiService) {}

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
}
