import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buttons.html',
  styleUrls: ['./buttons.css'],
})
export class ButtonsComponent implements OnInit {
  private router = inject(Router);

  usuarioId: number | null = null;

  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      this.usuarioId = JSON.parse(usuarioStr).id;
    }
  }

  recogerPedido() {
    if (!this.usuarioId) {
      alert('Debes estar registrado para hacer un pedido');
      this.router.navigate(['/register']);
      return;
    }
    this.router.navigate(['/pedido/recoger']);
  }

  reservarPedido() {
    if (!this.usuarioId) {
      alert('Debes estar registrado para reservar');
      this.router.navigate(['/register']);
      return;
    }
    this.router.navigate(['/pedido/reserva']);
  }
}

