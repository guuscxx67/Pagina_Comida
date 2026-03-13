import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ModalService, ModalData } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrls: ['./modal.css']
})
export class ModalComponent implements OnInit, OnDestroy {
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);
  private sub!: Subscription;

  visible = false;
  data: ModalData | null = null;
  private resolveFn: ((v: boolean) => void) | null = null;

  ngOnInit() {
    this.sub = this.modalService.modal$.subscribe((m) => {
      this.data = m;
      this.resolveFn = m.resolve;
      this.visible = true;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  aceptar() {
    this.resolveFn?.(true);
    this.cerrar();
  }

  cancelar() {
    this.resolveFn?.(false);
    this.cerrar();
  }

  private cerrar() {
    this.visible = false;
    this.data = null;
    this.resolveFn = null;
  }
}
