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
  private apiUrl = 'http://localhost:5000/api/platos'; 

  constructor(private http: HttpClient) {}

  getPlatos(): Observable<Plato[]> {
    return this.http.get<Plato[]>(this.apiUrl);
  }


  getPlatoById(id: number): Observable<Plato> {
    return this.http.get<Plato>(`${this.apiUrl}/${id}`);
  }


  getPlatosDestacados(): Observable<Plato[]> {
    return this.http.get<Plato[]>(`${this.apiUrl}/destacados`);
  }


  getPlatosByCategoria(categoria: string): Observable<Plato[]> {
    return this.http.get<Plato[]>(`${this.apiUrl}/categoria/${categoria}`);
  }

  crearPlato(plato: Plato): Observable<Plato> {
    return this.http.post<Plato>(this.apiUrl, plato);
  }

  actualizarPlato(id: number, plato: Plato): Observable<Plato> {
    return this.http.put<Plato>(`${this.apiUrl}/${id}`, plato);
  }


  eliminarPlato(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
