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

    if (!nombre || !email) {
      this.modal.error('Nombre y correo son obligatorios');
      return;
    }

    this.guardando = true;

    this.api.actualizarUsuario(this.usuario.id, {
      nombre,
      email,
      telefono: this.telefono.trim(),
      direccion_favorita: {
        calle: this.direccionFavorita.calle.trim(),
        numero_exterior: this.direccionFavorita.numero_exterior.trim(),
        numero_interior: this.direccionFavorita.numero_interior.trim(),
        colonia: this.direccionFavorita.colonia.trim(),
        codigo_postal: this.direccionFavorita.codigo_postal.trim(),
        referencia: this.direccionFavorita.referencia.trim(),
      },
      password: this.nuevaPassword.trim() || undefined,
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
