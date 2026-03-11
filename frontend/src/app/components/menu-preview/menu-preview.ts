import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';

interface CategoriaResumen {
  nombre: string;
  descripcion: string;
  precioMinimo: number;
}

@Component({
  selector: 'app-menu-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu-preview.html',
  styleUrls: ['./menu-preview.css'],
})
export class MenuPreviewComponent implements OnInit {
  private api = inject(ApiService);

  categorias: CategoriaResumen[] = [];
  ofertaDelDia: any = null;

  ngOnInit() {
    this.api.obtenerRecetas().subscribe({
      next: (recetas: any[]) => {
        if (recetas.length === 0) return;

        // Oferta del día: primer platillo de "Menú del Día", o el más barato
        const menuDia = recetas.filter(r => r.categoria === 'Menú del Día');
        this.ofertaDelDia = menuDia[0] || recetas[0];

        // Agrupar por categoría
        const map = new Map<string, any[]>();
        for (const r of recetas) {
          if (!map.has(r.categoria)) map.set(r.categoria, []);
          map.get(r.categoria)!.push(r);
        }

        this.categorias = Array.from(map.entries()).map(([nombre, items]) => ({
          nombre,
          descripcion: items.map(i => i.nombre).slice(0, 3).join(', '),
          precioMinimo: Math.min(...items.map(i => i.precio)),
        }));
      },
      error: () => {
        // Si falla la API, se muestra el HTML estático (no se reemplaza)
      }
    });
  }
}
