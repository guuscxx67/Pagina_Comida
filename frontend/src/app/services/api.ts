import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  // Health Check
  healthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }

  // Menu Endpoints
  getMenu(): Observable<any> {
    return this.http.get(`${this.apiUrl}/menu`);
  }

  getMenuItem(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/menu/${id}`);
  }

  getMenuByCategory(category: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/menu/category/${category}`);
  }

  // User Endpoints
  getUser(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  getUserProfile(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}/profile`);
  }

  updateUserProfile(userId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/${userId}/profile`, data);
  }

  // Order Endpoints
  getUserOrders(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}/orders`);
  }

  createOrder(userId: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/${userId}/orders`, data);
  }

  // Reservation Endpoints
  createReservation(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservations`, data);
  }

  // Contact Endpoints
  sendContact(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/contact`, data);
  }
}
