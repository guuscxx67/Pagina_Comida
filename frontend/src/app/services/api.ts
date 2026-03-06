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

  obtenerPedido(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/pedidos/${id}`);
  }

  actualizarPedido(id: number, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/pedidos/${id}`, datos);
  }

  obtenerPedidosUsuario(usuarioId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/pedidos/usuario/${usuarioId}`);
  }

  obtenerPedidosAdmin(adminId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/pedidos`, { params: { admin_id: adminId } });
  }

  actualizarEstadoPedidoAdmin(adminId: number, pedidoId: number, estado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/pedidos/${pedidoId}/estado`, {
      admin_id: adminId,
      estado
    });
  }
}
