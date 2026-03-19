import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class ProfileComponent implements OnInit {
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  private readonly telefonoPattern = /^\d{10,12}$/;
  private readonly passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

  public usuario: any = null;
  public pedidos: any[] = [];
  public nombre = '';
  public email = '';
  public telefono = '';
  public nuevaPassword = '';
  public guardando = false;
  public direccionFavorita = {
    calle: '',
    numero_exterior: '',
    numero_interior: '',
    colonia: '',
    codigo_postal: '',
    referencia: '',
  };

  constructor(
    private api: ApiService,
    private router: Router,
    private modal: ModalService
  ) {}

  ngOnInit() {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuario = JSON.parse(usuarioGuardado);
      this.cargarFormulario();
      this.cargarPedidos();
      return;
    }

    this.router.navigate(['/register']);
  }

  cargarPedidos() {
    if (!this.usuario) return;

    this.api.obtenerPedidosUsuario(this.usuario.id).subscribe({
      next: (res: any) => (this.pedidos = res),
      error: () => {}
    });
  }

  guardarCambios() {
    if (!this.usuario) return;

    const nombre = this.nombre.trim();
    const email = this.email.trim();
    const telefono = this.telefono.trim();
    const password = this.nuevaPassword.trim();

    if (!nombre || !email || !telefono) {
      this.modal.error('Nombre, correo y telefono son obligatorios');
      return;
    }

    if (nombre.length < 2) {
      this.modal.error('El nombre debe tener al menos 2 caracteres');
      return;
    }

    if (!this.emailPattern.test(email)) {
      this.modal.error('Ingresa un correo valido');
      return;
    }

    if (!this.telefonoPattern.test(telefono)) {
      this.modal.error('El telefono debe tener solo numeros y entre 10 y 12 digitos');
      return;
    }

    if (password && !this.passwordPattern.test(password)) {
      this.modal.error('La contrasena debe tener minimo 8 caracteres, una mayuscula, un numero y un caracter especial');
      return;
    }

    this.guardando = true;

    this.api.actualizarUsuario(this.usuario.id, {
      nombre,
      email,
      telefono,
      direccion_favorita: {
        calle: this.direccionFavorita.calle.trim(),
        numero_exterior: this.direccionFavorita.numero_exterior.trim(),
        numero_interior: this.direccionFavorita.numero_interior.trim(),
        colonia: this.direccionFavorita.colonia.trim(),
        codigo_postal: this.direccionFavorita.codigo_postal.trim(),
        referencia: this.direccionFavorita.referencia.trim(),
      },
      password: password || undefined,
    }).subscribe({
      next: (res: any) => {
        localStorage.setItem('usuario', JSON.stringify(res));
        this.usuario = res;
        this.nuevaPassword = '';
        this.cargarFormulario();
        this.modal.exito('Perfil actualizado correctamente');
      },
      error: (e) => this.modal.error(e?.error?.error || 'No se pudo actualizar el perfil'),
      complete: () => {
        this.guardando = false;
      }
    });
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.usuario = null;
    this.pedidos = [];
    this.router.navigate(['/home']);
  }

  volverInicio() {
    this.router.navigate(['/home']);
  }

  normalizarTelefono() {
    this.telefono = this.telefono.replace(/\D/g, '').slice(0, 12);
  }

  private cargarFormulario() {
    this.nombre = this.usuario?.nombre || '';
    this.email = this.usuario?.email || '';
    this.telefono = this.usuario?.telefono || '';
    this.direccionFavorita = {
      calle: this.usuario?.direccion_favorita?.calle || '',
      numero_exterior: this.usuario?.direccion_favorita?.numero_exterior || '',
      numero_interior: this.usuario?.direccion_favorita?.numero_interior || '',
      colonia: this.usuario?.direccion_favorita?.colonia || '',
      codigo_postal: this.usuario?.direccion_favorita?.codigo_postal || '',
      referencia: this.usuario?.direccion_favorita?.referencia || '',
    };
  }
}
