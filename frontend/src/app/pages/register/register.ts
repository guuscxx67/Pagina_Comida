import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { ApiService } from '../../services/api';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-8px)' }))
      ])
    ])
  ]
})
export class RegisterComponent {
  private api = inject(ApiService);
  private router = inject(Router);
  private modal = inject(ModalService);

  modo: 'login' | 'registro' = 'login';
  cargando = false;
  mostrarPass = false;

  loginEmail = '';
  loginPassword = '';

  nombre = '';
  email = '';
  password = '';
  telefono = '';

  iniciarSesion() {
    if (!this.loginEmail || !this.loginPassword) {
      this.modal.alerta('Ingresa correo y contrasena');
      return;
    }
    this.cargando = true;
    this.api.login(this.loginEmail, this.loginPassword).subscribe({
      next: (res: any) => {
        localStorage.setItem('usuario', JSON.stringify(res));
        this.router.navigate([res.es_admin ? '/admin' : '/home']);
      },
      error: (e) => {
        this.cargando = false;
        this.modal.error(e?.error?.error || 'Credenciales incorrectas');
      }
    });
  }

  registrar() {
    if (!this.nombre || !this.email || !this.password) {
      this.modal.alerta('Nombre, correo y contrasena son obligatorios');
      return;
    }
    this.cargando = true;
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
      error: (e) => {
        this.cargando = false;
        this.modal.error(e?.error?.error || 'Error al registrar');
      }
    });
  }
}
