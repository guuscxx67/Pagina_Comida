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
  }
}
