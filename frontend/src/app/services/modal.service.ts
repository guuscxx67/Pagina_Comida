import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ModalData {
  tipo: 'alerta' | 'confirmar' | 'exito' | 'error';
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private modalSubject = new Subject<ModalData & { resolve: (v: boolean) => void }>();
  modal$ = this.modalSubject.asObservable();

  alerta(mensaje: string, titulo = 'Aviso'): Promise<boolean> {
    return this.abrir({ tipo: 'alerta', titulo, mensaje });
  }

  error(mensaje: string, titulo = 'Error'): Promise<boolean> {
    return this.abrir({ tipo: 'error', titulo, mensaje });
  }

  exito(mensaje: string, titulo = 'Listo'): Promise<boolean> {
    return this.abrir({ tipo: 'exito', titulo, mensaje });
  }

  confirmar(mensaje: string, titulo = 'Confirmar'): Promise<boolean> {
    return this.abrir({ tipo: 'confirmar', titulo, mensaje, textoConfirmar: 'Si', textoCancelar: 'No' });
  }

  private abrir(data: ModalData): Promise<boolean> {
    return new Promise((resolve) => {
      this.modalSubject.next({ ...data, resolve });
    });
  }
}
