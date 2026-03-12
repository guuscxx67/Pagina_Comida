import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  private api = inject(ApiService);
  private router = inject(Router);

  modo: 'login' | 'registro' = 'login';

  // Login
  loginEmail = '';
  loginPassword = '';

  // Registro
  nombre = '';
  email = '';
  password = '';
  telefono = '';

  iniciarSesion() {
    if (!this.loginEmail || !this.loginPassword) {
      alert('Ingresa correo y contraseña');
      return;
    }
    this.api.login(this.loginEmail, this.loginPassword).subscribe({
      next: (res: any) => {
        localStorage.setItem('usuario', JSON.stringify(res));
        this.router.navigate([res.es_admin ? '/admin' : '/home']);
      },
      error: (e) => alert(e?.error?.error || 'Credenciales incorrectas')
    });
  }

  registrar() {
    if (!this.nombre || !this.email || !this.password) {
      alert('Nombre, correo y contraseña son obligatorios');
      return;
    }
    this.api.register({
      nombre: this.nombre,
      email: this.email,
      password: this.password,
      telefono: this.telefono,
      es_admin: false
    }).subscribe({
      next: (res: any) => {
        localStorage.setItem('usuario', JSON.stringify(res));
        this.router.navigate(['/home']);
      },
      error: (e) => alert(e?.error?.error || 'Error al registrar')
    });
  }
}
