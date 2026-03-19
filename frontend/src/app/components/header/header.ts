import { Component, DoCheck, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class HeaderComponent implements OnInit, DoCheck {
  usuario: any = null;
  menuAbierto = false;

  ngOnInit() {
    this.sincronizarUsuario();
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

  private sincronizarUsuario() {
    const usuarioGuardado = localStorage.getItem('usuario');
    this.usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  }
}
