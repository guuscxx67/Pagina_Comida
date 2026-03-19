import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ItemCarrito {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  precio: number;
  cantidad: number;
  categoria?: string;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private itemsSubject = new BehaviorSubject<ItemCarrito[]>([]);
  items$: Observable<ItemCarrito[]> = this.itemsSubject.asObservable();

  constructor() {
    this.cargarDelLocalStorage();
  }

  private cargarDelLocalStorage() {
    const carrito = localStorage.getItem('carrito');
    if (carrito) {
      try {
        this.itemsSubject.next(JSON.parse(carrito));
      } catch (e) {
        console.error('Error al cargar carrito:', e);
      }
    }
  }

  private guardarEnLocalStorage() {
    localStorage.setItem('carrito', JSON.stringify(this.itemsSubject.value));
  }

  obtenerItems(): ItemCarrito[] {
    return this.itemsSubject.value;
  }

  agregarItem(item: ItemCarrito): void {
    const items = this.itemsSubject.value;
    const itemExistente = items.find(i => i.id === item.id);

    if (itemExistente) {
      itemExistente.cantidad += item.cantidad;
    } else {
      items.push(item);
    }

    this.itemsSubject.next([...items]);
    this.guardarEnLocalStorage();
  }

  eliminarItem(id: string): void {
    const items = this.itemsSubject.value.filter(i => i.id !== id);
    this.itemsSubject.next(items);
    this.guardarEnLocalStorage();
  }

  limpiarCarrito(): void {
    this.itemsSubject.next([]);
    localStorage.removeItem('carrito');
  }

  obtenerTotal(): number {
    return this.itemsSubject.value.reduce(
      (total, item) => total + (item.precio * item.cantidad),
      0
    );
  }
}
