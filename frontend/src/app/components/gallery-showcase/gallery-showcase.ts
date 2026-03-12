import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { interval, Subscription } from 'rxjs';

interface Plato {
  id: string;
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
  private cdr = inject(ChangeDetectorRef);

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

  cargarPlatos() {
    this.error = null;
    this.api.obtenerRecetas().subscribe({
      next: (data: any) => {
        this.platos = (data || [])
          .filter((p: any) => p.disponible)
          .map((p: any, index: number) => ({
            id: p.id,
            nombre: p.nombre,
            descripcion: p.descripcion,
            imagen: p.imagen,
            precio: p.precio,
            categoria: p.categoria,
            disponible: p.disponible,
            destacado: index < 3 
          }));
        this.cargando = false;
        this.error = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar platos:', err);
        this.error = 'Error al cargar los platos. Intenta recargar la página.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  scrollToSection(id: string) {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  }

  verDetalles(plato: Plato) {
    this.platoSeleccionado = plato;
    this.modalVisible = true;
    this.cdr.detectChanges();
  }

  cerrarModal() {
    this.modalVisible = false;
    this.platoSeleccionado = null;
    this.cdr.detectChanges();
  }

  agregarAlCarrito(plato: Plato) {
    this.cerrarModal();
    localStorage.setItem('platoSeleccionado', JSON.stringify(plato));
    this.cdr.detectChanges();
    this.router.navigate(['/pedido/recoger']);
  }
}
