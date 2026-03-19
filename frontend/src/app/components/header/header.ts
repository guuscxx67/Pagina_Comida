import { Component, DoCheck, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent implements OnInit, DoCheck {
  private themeService = inject(ThemeService);
  usuario: any = null;
  menuAbierto = false;
  isDarkMode = false;

  ngOnInit() {
    this.sincronizarUsuario();
    
    this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  ngDoCheck() {
    this.sincronizarUsuario();
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.usuario = null;
    this.menuAbierto = false;
    window.location.href = '/home';
  }

  toggleTheme() {
    this.themeService.toggleDarkMode();
  }

  private sincronizarUsuario() {
    const usuarioGuardado = localStorage.getItem('usuario');
    this.usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  }
}
