import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class HeaderComponent implements OnInit {
  usuario: any = null;

  ngOnInit() {
    const u = localStorage.getItem('usuario');
    if (u) this.usuario = JSON.parse(u);
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    this.usuario = null;
    window.location.href = '/home';
  }
}
