import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api';
import { ModalService } from '../../services/modal.service';
import { CarritoService } from '../../services/carrito.service';
import { interval, Subscription } from 'rxjs';

interface MenuItem {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  cantidad: number;
}

interface EstadoPedido {
  tipo: 'reserva' | 'recoger' | 'domicilio';
  menu: MenuItem[];
  notas: string;
  fechaRecogida: string;
  horaRecogida: string;
  calle: string;
  numeroExterior: string;
  numeroInterior: string;
  colonia: string;
  codigoPostal: string;
  referencia: string;
  telefonoContacto: string;
}

interface DireccionFavorita {
  calle: string;
  numero_exterior: string;
  numero_interior: string;
  colonia: string;
  codigo_postal: string;
  referencia: string;
}

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedido.html',
  styleUrls: ['./pedido.css'],
})
export class PedidoComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private modal = inject(ModalService);
  private carrito = inject(CarritoService);

  private readonly STORAGE_KEY = 'pedido_guardado';
  private readonly telefonoPattern = /^\d{10,12}$/;
  private readonly codigoPostalPattern = /^\d{5}$/;
  private autoSaveSubscription: Subscription | null = null;

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
  direccionFavoritaDisponible = false;
  camposTocados = {
    fechaRecogida: false,
    calle: false,
    numeroExterior: false,
    colonia: false,
    codigoPostal: false,
    telefonoContacto: false,
  };

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

    this.aplicarDireccionFavoritaSiExiste();

    this.api.obtenerRecetas().subscribe({
      next: (recetas: any[]) => {
        this.menu = recetas.map(r => ({ ...r, cantidad: 0 }));
        
        // Primero, intentar cargar estado guardado
        const estadoGuardado = this.cargarEstado();
        console.log('¿Hay estado guardado?', estadoGuardado !== null);
        if (estadoGuardado && estadoGuardado.tipo === this.tipo) {
          console.log('Estado coincide con tipo actual, restaurando...');
          this.restaurarEstado(estadoGuardado);
          console.log('Estado restaurado del almacenamiento');
        } else {
          console.log('No hay estado guardado o tipo no coincide, usando carrito compartido');
          // Si no hay estado guardado, cargar desde carrito compartido
          const itemsCarrito = this.carrito.obtenerItems();
          console.log('Items en carrito:', itemsCarrito);
          console.log('Menu IDs:', this.menu.map(m => ({ id: m.id, nombre: m.nombre })));
          
          itemsCarrito.forEach(itemCarrito => {
            const menuItem = this.menu.find(m => String(m.id) === String(itemCarrito.id));
            if (menuItem) {
              console.log('Item encontrado:', menuItem.nombre, 'cantidad:', itemCarrito.cantidad);
              menuItem.cantidad = itemCarrito.cantidad;
            } else {
              // Si no está en el menú, lo agregamos como un nuevo item
              console.log('Item no encontrado en menu, agregando como nuevo:', itemCarrito.id);
              this.menu.push({
                id: itemCarrito.id,
                nombre: itemCarrito.nombre,
                descripcion: itemCarrito.descripcion,
                precio: itemCarrito.precio,
                categoria: itemCarrito.categoria || 'Otros',
                cantidad: itemCarrito.cantidad
              });
            }
          });
          
          // Limpiar carrito después de cargar
          this.carrito.limpiarCarrito();
        }
        
        this.cargandoMenu = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.modal.error('No se pudo cargar el menu. Verifica que el servidor este activo.');
        this.cargandoMenu = false;
        this.cdr.detectChanges();
      }
    });

    // Auto-save cada 3 segundos como respaldo
    this.autoSaveSubscription = interval(3000).subscribe(() => {
      this.guardarEstado();
    });
  }

  ngOnDestroy(): void {
    if (this.autoSaveSubscription) {
      this.autoSaveSubscription.unsubscribe();
    }
  }

  get hoyISO(): string {
    return new Date().toISOString().split('T')[0];
  }

  guardarEstado(): void {
    const estado: EstadoPedido = {
      tipo: this.tipo,
      menu: this.menu,
      notas: this.notas,
      fechaRecogida: this.fechaRecogida,
      horaRecogida: this.horaRecogida,
      calle: this.calle,
      numeroExterior: this.numeroExterior,
      numeroInterior: this.numeroInterior,
      colonia: this.colonia,
      codigoPostal: this.codigoPostal,
      referencia: this.referencia,
      telefonoContacto: this.telefonoContacto
    };
    console.log('Guardando estado:', estado);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(estado));
    console.log('Estado guardado en localStorage');
  }

  private cargarEstado(): EstadoPedido | null {
    const estado = localStorage.getItem(this.STORAGE_KEY);
    console.log('Estado cargado del localStorage:', estado);
    if (!estado) return null;
    try {
      return JSON.parse(estado);
    } catch (e) {
      console.error('Error al cargar estado:', e);
      return null;
    }
  }

  private restaurarEstado(estado: EstadoPedido): void {
    console.log('Restaurando estado:', estado);
    this.menu = estado.menu;
    this.notas = estado.notas;
    this.fechaRecogida = estado.fechaRecogida;
    this.horaRecogida = estado.horaRecogida;
    this.calle = estado.calle;
    this.numeroExterior = estado.numeroExterior;
    this.numeroInterior = estado.numeroInterior;
    this.colonia = estado.colonia;
    this.codigoPostal = estado.codigoPostal;
    this.referencia = estado.referencia;
    this.telefonoContacto = estado.telefonoContacto;
  }

  private limpiarEstadoGuardado(): void {
    console.log('Limpiando estado guardado');
    localStorage.removeItem(this.STORAGE_KEY);
  }

  get direccionFavoritaTexto(): string {
    const direccion = this.obtenerDireccionFavorita();
    if (!direccion) return '';

    const partes = [
      direccion.calle ? `${direccion.calle} ${direccion.numero_exterior ? `#${direccion.numero_exterior}` : ''}`.trim() : '',
      direccion.numero_interior ? `Int. ${direccion.numero_interior}` : '',
      direccion.colonia,
      direccion.codigo_postal ? `CP ${direccion.codigo_postal}` : '',
    ].filter(Boolean);

    return partes.join(', ');
  }

  get itemsSeleccionados(): MenuItem[] {
    return this.menu.filter(i => i.cantidad > 0);
  }

  get total(): number {
    return this.menu.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
  }

  incrementar(item: MenuItem) {
    item.cantidad++;
    this.guardarEstado();
    this.cdr.detectChanges();
  }

  decrementar(item: MenuItem) {
    if (item.cantidad > 0) item.cantidad--;
    this.guardarEstado();
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
      this.camposTocados.fechaRecogida = true;
      this.modal.alerta('Selecciona la fecha de la reserva');
      return;
    }
    if (this.tipo === 'domicilio') {
      this.marcarCamposDomicilio();
      if (
        this.obtenerMensajeErrorCampo('calle') ||
        this.obtenerMensajeErrorCampo('numeroExterior') ||
        this.obtenerMensajeErrorCampo('colonia') ||
        this.obtenerMensajeErrorCampo('codigoPostal') ||
        this.obtenerMensajeErrorCampo('telefonoContacto')
      ) {
        this.modal.alerta('Corrige los campos marcados antes de confirmar');
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
        
        // Limpiar el estado guardado después de crear el pedido exitosamente
        this.limpiarEstadoGuardado();
        
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

  usarDireccionFavorita() {
    const direccion = this.obtenerDireccionFavorita();
    if (!direccion) return;

    this.calle = direccion.calle;
    this.numeroExterior = direccion.numero_exterior;
    this.numeroInterior = direccion.numero_interior;
    this.colonia = direccion.colonia;
    this.codigoPostal = direccion.codigo_postal;
    this.referencia = direccion.referencia;

    if (!this.telefonoContacto.trim() && this.usuario?.telefono) {
      this.telefonoContacto = this.usuario.telefono;
    }

    this.guardarEstado();
    this.cdr.detectChanges();
  }

  marcarCampoComoTocado(campo: keyof typeof this.camposTocados) {
    this.camposTocados[campo] = true;
  }

  campoInvalido(campo: keyof typeof this.camposTocados): boolean {
    return this.camposTocados[campo] && !!this.obtenerMensajeErrorCampo(campo);
  }

  obtenerMensajeErrorCampo(campo: keyof typeof this.camposTocados): string {
    switch (campo) {
      case 'fechaRecogida':
        return this.fechaRecogida ? '' : 'Selecciona una fecha';
      case 'calle':
        if (!this.calle.trim()) return 'Calle obligatoria';
        return this.calle.trim().length >= 3 ? '' : 'Minimo 3 caracteres';
      case 'numeroExterior':
        return this.numeroExterior.trim() ? '' : 'Numero exterior obligatorio';
      case 'colonia':
        if (!this.colonia.trim()) return 'Colonia obligatoria';
        return this.colonia.trim().length >= 2 ? '' : 'Minimo 2 caracteres';
      case 'codigoPostal':
        if (!this.codigoPostal.trim()) return '';
        return this.codigoPostalPattern.test(this.codigoPostal.trim()) ? '' : 'Debe tener 5 digitos';
      case 'telefonoContacto':
        if (!this.telefonoContacto.trim()) return 'Telefono obligatorio';
        return this.telefonoPattern.test(this.telefonoContacto.trim()) ? '' : 'Solo numeros, 10 a 12 digitos';
      default:
        return '';
    }
  }

  normalizarTelefonoContacto() {
    this.telefonoContacto = this.telefonoContacto.replace(/\D/g, '').slice(0, 12);
  }

  normalizarCodigoPostal() {
    this.codigoPostal = this.codigoPostal.replace(/\D/g, '').slice(0, 5);
  }

  cancelarPedido() {
    this.modal.confirmar('¿Deseas cancelar el pedido? Los cambios no guardados se perderán.').then((confirmado) => {
      if (confirmado) {
        this.limpiarEstadoGuardado();
        this.modal.exito('Pedido cancelado');
        this.volver();
      }
    });
  }

  private aplicarDireccionFavoritaSiExiste() {
    const direccion = this.obtenerDireccionFavorita();
    this.direccionFavoritaDisponible = !!direccion;

    if (!direccion || this.tipo !== 'domicilio') return;

    const yaCapturoDireccion = [
      this.calle,
      this.numeroExterior,
      this.numeroInterior,
      this.colonia,
      this.codigoPostal,
      this.referencia,
    ].some(valor => valor.trim().length > 0);

    if (!yaCapturoDireccion) {
      this.usarDireccionFavorita();
    }
  }

  private obtenerDireccionFavorita(): DireccionFavorita | null {
    const direccion = this.usuario?.direccion_favorita;
    if (!direccion) return null;

    const normalizada: DireccionFavorita = {
      calle: direccion.calle || '',
      numero_exterior: direccion.numero_exterior || '',
      numero_interior: direccion.numero_interior || '',
      colonia: direccion.colonia || '',
      codigo_postal: direccion.codigo_postal || '',
      referencia: direccion.referencia || '',
    };

    const tieneDatos = Object.values(normalizada).some(valor => valor.trim().length > 0);
    return tieneDatos ? normalizada : null;
  }

  private marcarCamposDomicilio() {
    this.camposTocados.calle = true;
    this.camposTocados.numeroExterior = true;
    this.camposTocados.colonia = true;
    this.camposTocados.codigoPostal = true;
    this.camposTocados.telefonoContacto = true;
  }
}