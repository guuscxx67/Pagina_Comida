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
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  private api = inject(ApiService);
  private router = inject(Router);

  nombre = '';
  email = '';
  password = '';
  telefono = '';
  es_admin = false;

  registrar() {
    this.api.register({
      nombre: this.nombre,
      email: this.email,
      password: this.password,
      telefono: this.telefono,
      es_admin: this.es_admin
    }).subscribe({
      next: (res: any) => {
        localStorage.setItem('usuario', JSON.stringify(res));
        this.router.navigate([res.es_admin ? '/admin' : '/home']);
      },
      error: (e) => alert(e?.error?.error || 'Error al registrar')
    });
  }
}