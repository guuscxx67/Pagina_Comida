import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api';

interface MenuItem {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  cantidad: number;
}

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedido.html',
  styleUrls: ['./pedido.css'],
})
export class PedidoComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  tipo: 'reserva' | 'recoger' = 'recoger';
  usuario: any = null;
  notas = '';
  fechaRecogida = '';
  horaRecogida = '';
  enviando = false;
  cargandoMenu = true;

  menu: MenuItem[] = [];

  get categorias(): string[] {
    const cats = [...new Set(this.menu.map(i => i.categoria))];
    return cats;
  }

  itemsPorCategoria(cat: string): MenuItem[] {
    return this.menu.filter(i => i.categoria === cat);
  }

  ngOnInit() {
    const u = localStorage.getItem('usuario');
    if (!u) {
      this.router.navigate(['/register']);
      return;
    }
    this.usuario = JSON.parse(u);
    const param = this.route.snapshot.paramMap.get('tipo');
    this.tipo = param === 'reserva' ? 'reserva' : 'recoger';

    this.api.obtenerRecetas().subscribe({
      next: (recetas: any[]) => {
        this.menu = recetas.map(r => ({ ...r, cantidad: 0 }));
        this.cargandoMenu = false;
      },
      error: () => {
        alert('No se pudo cargar el menú. Verifica que el servidor esté activo.');
        this.cargandoMenu = false;
      }
    });
  }

  get hoyISO(): string {
    return new Date().toISOString().split('T')[0];
  }

  get itemsSeleccionados(): MenuItem[] {
    return this.menu.filter(i => i.cantidad > 0);
  }

  get total(): number {
    return this.menu.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  }

  incrementar(item: MenuItem) {
    item.cantidad++;
  }

  decrementar(item: MenuItem) {
    if (item.cantidad > 0) item.cantidad--;
  }

  volver() {
    this.router.navigate(['/home']);
  }

  confirmarPedido() {
    if (this.total === 0) {
      alert('Selecciona al menos un platillo');
      return;
    }
    if (this.tipo === 'reserva' && !this.fechaRecogida) {
      alert('Selecciona la fecha de la reserva');
      return;
    }

    this.enviando = true;

    let fechaISO: string | undefined;
    if (this.tipo === 'reserva' && this.fechaRecogida) {
      const hora = this.horaRecogida || '12:00';
      fechaISO = new Date(`${this.fechaRecogida}T${hora}`).toISOString();
    }

    const pedido: any = {
      usuario_id: this.usuario.id,
      tipo: this.tipo === 'reserva' ? 'reserva' : 'recogida',
      total: this.total,
      items: this.itemsSeleccionados.map(i => ({ nombre: i.nombre, cantidad: i.cantidad })),
      notas: this.notas,
    };

    if (fechaISO) pedido.fecha_recogida = fechaISO;

    this.api.crearPedido(pedido).subscribe({
      next: (res: any) => {
        alert(`¡Pedido #${res.id} creado con éxito!`);
        this.router.navigate(['/profile']);
      },
      error: (e: any) => {
        alert(e?.error?.error || 'Error al crear el pedido');
        this.enviando = false;
      },
    });
  }
}
