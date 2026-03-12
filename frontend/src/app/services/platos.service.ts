import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Plato {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  precio: number;
  destacado?: boolean;
  categoria?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlatosService {
  private apiUrl = 'http://localhost:5000/api/platos'; // Cambiar según tu backend

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los platos
   */
  getPlatos(): Observable<Plato[]> {
    return this.http.get<Plato[]>(this.apiUrl);
  }

  /**
   * Obtener un plato específico por ID
   */
  getPlatoById(id: number): Observable<Plato> {
    return this.http.get<Plato>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener platos destacados
   */
  getPlatosDestacados(): Observable<Plato[]> {
    return this.http.get<Plato[]>(`${this.apiUrl}/destacados`);
  }

  /**
   * Obtener platos por categoría
   */
  getPlatosByCategoria(categoria: string): Observable<Plato[]> {
    return this.http.get<Plato[]>(`${this.apiUrl}/categoria/${categoria}`);
  }

  /**
   * Crear un nuevo plato (solo admin)
   */
  crearPlato(plato: Plato): Observable<Plato> {
    return this.http.post<Plato>(this.apiUrl, plato);
  }

  /**
   * Actualizar un plato existente (solo admin)
   */
  actualizarPlato(id: number, plato: Plato): Observable<Plato> {
    return this.http.put<Plato>(`${this.apiUrl}/${id}`, plato);
  }

  /**
   * Eliminar un plato (solo admin)
   */
  eliminarPlato(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
