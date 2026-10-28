import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Order {
  id?: number;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  customer_address: string;
  status: string;
  total_amount: number;
  created_at?: string;
  invoice_number?: string;
  is_quote?: boolean;
  items: any[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders/`;

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}${orderId}/`, { status });
  }

  getForecast(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/forecast/`);
  }

  downloadInvoice(orderId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}${orderId}/download_invoice/`, { responseType: 'blob' });
  }

  downloadDeliverySlip(orderId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}${orderId}/download_delivery_slip/`, { responseType: 'blob' });
  }

  getPendingCount(): Observable<{count: number}> {
    return this.http.get<{count: number}>(`${this.apiUrl}pending_count/`);
  }
}
