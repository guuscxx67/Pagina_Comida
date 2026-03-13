import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  register(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, datos);
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  crearPedido(pedido: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/pedidos`, pedido);
  }

  obtenerPedido(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pedidos/${id}`);
  }

  actualizarPedido(id: string, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/pedidos/${id}`, datos);
  }

  obtenerPedidosUsuario(usuarioId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/pedidos/usuario/${usuarioId}`);
  }

  obtenerPedidosAdmin(adminId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/pedidos`, { params: { admin_id: adminId } });
  }

  actualizarEstadoPedidoAdmin(adminId: string, pedidoId: string, estado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/pedidos/${pedidoId}/estado`, {
      admin_id: adminId,
      estado
    });
  }

  eliminarPedidoAdmin(adminId: string, pedidoId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/pedidos/${pedidoId}`, { params: { admin_id: adminId } });
  }

  // Recetas — público
  obtenerRecetas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/recetas`);
  }

  // Recetas — admin
  obtenerRecetasAdmin(adminId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/recetas`, { params: { admin_id: adminId } });
  }

  crearReceta(adminId: string, receta: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/recetas`, { admin_id: adminId, ...receta });
  }

  actualizarReceta(adminId: string, id: string, receta: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/recetas/${id}`, { admin_id: adminId, ...receta });
  }

  eliminarReceta(adminId: string, id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/recetas/${id}`, { params: { admin_id: adminId } });
  }

  // Platos Estrella — público
  obtenerPlatosEstrella(): Observable<any> {
    return this.http.get(`${this.apiUrl}/platos-estrella`);
  }

  // Platos Estrella — admin
  obtenerPlatosEstrellaAdmin(adminId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/platos-estrella`, { params: { admin_id: adminId } });
  }

  crearPlatoEstrella(adminId: string, plato: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/platos-estrella`, { admin_id: adminId, ...plato });
  }

  actualizarPlatoEstrella(adminId: string, id: string, plato: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/platos-estrella/${id}`, { admin_id: adminId, ...plato });
  }

  eliminarPlatoEstrella(adminId: string, id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/platos-estrella/${id}`, { params: { admin_id: adminId } });
  }

  // Imágenes
  obtenerImagenes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/imagenes`);
  }

  subirImagen(adminId: string, archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('admin_id', adminId);
    formData.append('imagen', archivo);
    return this.http.post(`${this.apiUrl}/admin/imagenes/subir`, formData);
  }
}
