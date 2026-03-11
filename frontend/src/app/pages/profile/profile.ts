import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class ProfileComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  usuario: any = null;
  pedidos: any[] = [];
  email = '';
  password = '';

  ngOnInit() {
    const u = localStorage.getItem('usuario');
    if (u) {
      this.usuario = JSON.parse(u);
      this.cargarPedidos();
    }
  }

  login() {
    this.api.login(this.email, this.password).subscribe({
      next: (res: any) => {
        localStorage.setItem('usuario', JSON.stringify(res));
        this.usuario = res;
        this.cargarPedidos();
        this.router.navigate([res.es_admin ? '/admin' : '/home']);
      },
      error: (e) => alert(e?.error?.error || 'Credenciales inválidas')
    });
  }

  cargarPedidos() {
    if (!this.usuario) return;
    this.api.obtenerPedidosUsuario(this.usuario.id).subscribe({
      next: (res: any) => (this.pedidos = res),
      error: () => {}
    });
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.usuario = null;
    this.pedidos = [];
    this.router.navigate(['/home']);
  }
}
