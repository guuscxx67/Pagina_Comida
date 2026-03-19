import { Component, OnInit, inject } from '@angular/core';
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
export class HeaderComponent implements OnInit {
  private themeService = inject(ThemeService);
  usuario: any = null;
  menuAbierto = false;
  isDarkMode = false;

  ngOnInit() {
    const u = localStorage.getItem('usuario');
    if (u) this.usuario = JSON.parse(u);
    
    this.themeService.darkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
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
}
