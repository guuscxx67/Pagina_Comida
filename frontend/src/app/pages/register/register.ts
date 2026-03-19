import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { ApiService } from '../../services/api';
import { ModalService } from '../../services/modal.service';
import { ThemeService } from '../../services/theme.service';

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
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  private readonly telefonoPattern = /^\d{10,12}$/;
  private readonly passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  private api = inject(ApiService);
  private router = inject(Router);
  private modal = inject(ModalService);
  private themeService = inject(ThemeService);

  isDarkMode = false;

  modo: 'login' | 'registro' = 'login';
  cargando = false;
  mostrarPass = false;

  loginEmail = '';
  loginPassword = '';

  nombre = '';
  email = '';
  password = '';
  telefono = '';
  camposTocados = {
    loginEmail: false,
    loginPassword: false,
    nombre: false,
    email: false,
    password: false,
    telefono: false,
  };

  // 🔙 FUNCIÓN PARA REGRESAR AL HOME
  irHome() {
    this.router.navigate(['/home']);
  }

  ngOnInit() {
    this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  toggleTheme() {
    this.themeService.toggleDarkMode();
  }

  private obtenerMensajeError(error: any, respaldo: string) {
    if (error?.status === 0) {
      return 'No se pudo conectar con el servidor';
    }

    if (error?.status === 503) {
      return 'El servidor no tiene la base de datos disponible';
    }

    return error?.error?.error || respaldo;
  }

  iniciarSesion() {
    this.camposTocados.loginEmail = true;
    this.camposTocados.loginPassword = true;
    if (!this.loginEmail || !this.loginPassword) {
      this.modal.alerta('Ingresa correo y contrasena');
      return;
    }
    if (!this.emailPattern.test(this.loginEmail.trim())) {
      this.modal.alerta('Ingresa un correo valido');
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
        this.modal.error(this.obtenerMensajeError(e, 'Credenciales incorrectas'));
      }
    });
  }

  registrar() {
    this.camposTocados.nombre = true;
    this.camposTocados.email = true;
    this.camposTocados.password = true;
    this.camposTocados.telefono = true;

    if (!this.nombre.trim() || !this.email.trim() || !this.password.trim() || !this.telefono.trim()) {
      this.modal.alerta('Nombre, correo, contrasena y telefono son obligatorios');
      return;
    }
    if (this.obtenerMensajeErrorCampo('nombre') || this.obtenerMensajeErrorCampo('email') || this.obtenerMensajeErrorCampo('password') || this.obtenerMensajeErrorCampo('telefono')) {
      this.modal.alerta('Corrige los campos marcados antes de continuar');
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
        this.modal.error(this.obtenerMensajeError(e, 'Error al registrar'));
      }
    });
  }

  marcarCampoComoTocado(campo: keyof typeof this.camposTocados) {
    this.camposTocados[campo] = true;
  }

  campoInvalido(campo: keyof typeof this.camposTocados): boolean {
    return this.camposTocados[campo] && !!this.obtenerMensajeErrorCampo(campo);
  }

  obtenerMensajeErrorCampo(campo: keyof typeof this.camposTocados): string {
    switch (campo) {
      case 'loginEmail':
        if (!this.loginEmail.trim()) return 'Correo obligatorio';
        return this.emailPattern.test(this.loginEmail.trim()) ? '' : 'Correo invalido';
      case 'loginPassword':
        return this.loginPassword.trim() ? '' : 'Contrasena obligatoria';
      case 'nombre':
        if (!this.nombre.trim()) return 'Nombre obligatorio';
        return this.nombre.trim().length >= 2 ? '' : 'Minimo 2 caracteres';
      case 'email':
        if (!this.email.trim()) return 'Correo obligatorio';
        return this.emailPattern.test(this.email.trim()) ? '' : 'Correo invalido';
      case 'password':
        if (!this.password.trim()) return 'Contrasena obligatoria';
        return this.passwordPattern.test(this.password.trim())
          ? ''
          : 'Minimo 8 caracteres, 1 mayuscula, 1 numero y 1 especial';
      case 'telefono':
        if (!this.telefono.trim()) return 'Telefono obligatorio';
        return this.telefonoPattern.test(this.telefono.trim()) ? '' : 'Solo numeros, 10 a 12 digitos';
      default:
        return '';
    }
  }

  normalizarTelefono() {
    this.telefono = this.telefono.replace(/\D/g, '').slice(0, 12);
  }
}
