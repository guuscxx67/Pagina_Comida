import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api';
import { ModalService } from '../../services/modal.service';

interface MenuItem {
  id: string;
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
  private cdr = inject(ChangeDetectorRef);
  private modal = inject(ModalService);

  tipo: 'reserva' | 'recoger' | 'domicilio' = 'recoger';
  usuario: any = null;
  notas = '';
  fechaRecogida = '';
  horaRecogida = '';
  enviando = false;
  cargandoMenu = true;

  // Campos de dirección para domicilio
  calle = '';
  numeroExterior = '';
  numeroInterior = '';
  colonia = '';
  codigoPostal = '';
  referencia = '';
  telefonoContacto = '';

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
    if (param === 'reserva') this.tipo = 'reserva';
    else if (param === 'domicilio') this.tipo = 'domicilio';
    else this.tipo = 'recoger';

    if (this.usuario.telefono) {
      this.telefonoContacto = this.usuario.telefono;
    }

    this.api.obtenerRecetas().subscribe({
      next: (recetas: any[]) => {
        this.menu = recetas.map(r => ({ ...r, cantidad: 0 }));
        this.cargandoMenu = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.modal.error('No se pudo cargar el menu. Verifica que el servidor este activo.');
        this.cargandoMenu = false;
        this.cdr.detectChanges();
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
    this.cdr.detectChanges();
  }

  decrementar(item: MenuItem) {
    if (item.cantidad > 0) item.cantidad--;
    this.cdr.detectChanges();
  }

  volver() {
    this.cdr.detectChanges();
    this.router.navigate(['/home']);
  }

  confirmarPedido() {
    if (this.total === 0) {
      this.modal.alerta('Selecciona al menos un platillo');
      return;
    }
    if (this.tipo === 'reserva' && !this.fechaRecogida) {
      this.modal.alerta('Selecciona la fecha de la reserva');
      return;
    }
    if (this.tipo === 'domicilio') {
      if (!this.calle.trim()) {
        this.modal.alerta('Ingresa la calle de entrega');
        return;
      }
      if (!this.numeroExterior.trim()) {
        this.modal.alerta('Ingresa el número exterior');
        return;
      }
      if (!this.colonia.trim()) {
        this.modal.alerta('Ingresa la colonia');
        return;
      }
      if (!this.telefonoContacto.trim()) {
        this.modal.alerta('Ingresa un teléfono de contacto');
        return;
      }
    }

    this.enviando = true;

    let fechaISO: string | undefined;
    if (this.tipo === 'reserva' && this.fechaRecogida) {
      const hora = this.horaRecogida || '12:00';
      fechaISO = new Date(`${this.fechaRecogida}T${hora}`).toISOString();
    }

    const pedido: any = {
      usuario_id: this.usuario.id,
      tipo: this.tipo === 'reserva' ? 'reserva' : this.tipo === 'domicilio' ? 'domicilio' : 'recogida',
      total: this.total,
      items: this.itemsSeleccionados.map(i => ({ nombre: i.nombre, cantidad: i.cantidad })),
      notas: this.notas,
    };

    if (fechaISO) pedido.fecha_recogida = fechaISO;

    if (this.tipo === 'domicilio') {
      pedido.direccion = {
        calle: this.calle.trim(),
        numero_exterior: this.numeroExterior.trim(),
        numero_interior: this.numeroInterior.trim(),
        colonia: this.colonia.trim(),
        codigo_postal: this.codigoPostal.trim(),
        referencia: this.referencia.trim(),
        telefono_contacto: this.telefonoContacto.trim(),
      };
    }

    this.api.crearPedido(pedido).subscribe({
      next: async (res: any) => {
        let mensaje = `Pedido #${res.id.slice(0, 8)} creado con exito!`;
        if (this.tipo === 'domicilio') {
          mensaje += `\n\nTu pedido sera enviado a:\n${this.calle.trim()} #${this.numeroExterior.trim()}, Col. ${this.colonia.trim()}\n\nTe contactaremos al ${this.telefonoContacto.trim()}`;
        }
        await this.modal.exito(mensaje);
        this.cdr.detectChanges();
        this.router.navigate(['/home']);
      },
      error: (e: any) => {
        this.modal.error(e?.error?.error || 'Error al crear el pedido');
        this.enviando = false;
        this.cdr.detectChanges();
      },
    });
  }
}
