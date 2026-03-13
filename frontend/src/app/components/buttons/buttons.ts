import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './buttons.html',
  styleUrls: ['./buttons.css'],
})
export class ButtonsComponent implements OnInit {
  private router = inject(Router);
  private modal = inject(ModalService);

  usuarioId: number | null = null;

  ngOnInit() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      this.usuarioId = JSON.parse(usuarioStr).id;
    }
  }

  async recogerPedido() {
    if (!this.usuarioId) {
      await this.modal.alerta('Debes estar registrado para hacer un pedido');
      this.router.navigate(['/register']);
      return;
    }
    this.router.navigate(['/pedido/recoger']);
  }

  async reservarPedido() {
    if (!this.usuarioId) {
      await this.modal.alerta('Debes estar registrado para reservar');
      this.router.navigate(['/register']);
      return;
    }
    this.router.navigate(['/pedido/reserva']);
  }

  async pedidoDomicilio() {
    if (!this.usuarioId) {
      await this.modal.alerta('Debes estar registrado para pedir a domicilio');
      this.router.navigate(['/register']);
      return;
    }
    this.router.navigate(['/pedido/domicilio']);
  }
}
