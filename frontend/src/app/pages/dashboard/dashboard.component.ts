import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="sm:flex sm:items-center sm:justify-between mb-8">
        <h2 class="text-3xl font-extrabold text-gray-900">Tableau de Bord Gérant</h2>
        <button (click)="logout()" class="mt-3 sm:mt-0 bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-md text-sm font-medium transition-colors">
          Déconnexion
        </button>
      </div>

      <div *ngIf="loading" class="text-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        <p class="mt-2 text-gray-500">Chargement des commandes...</p>
      </div>

      <div *ngIf="!loading && orders.length === 0" class="text-center py-10 bg-white shadow rounded-lg">
        <p class="text-gray-500">Aucune commande n'a été trouvée.</p>
      </div>

      <div *ngIf="!loading && orders.length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID & Date
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Articles & Total
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let order of orders">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">#{{ order.id }}</div>
                  <div class="text-sm text-gray-500">{{ order.created_at | date:'dd/MM/yyyy HH:mm' }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ order.customer_name }}</div>
                  <div class="text-sm text-gray-500">{{ order.customer_phone }}</div>
                  <div class="text-sm text-gray-500 truncate w-48" [title]="order.customer_address">{{ order.customer_address }}</div>
                </td>
                <td class="px-6 py-4">
                  <ul class="text-sm text-gray-900 mb-2 list-disc list-inside">
                    <li *ngFor="let item of order.items">
                      {{ item.quantity }}x {{ item.product_name }}
                    </li>
                  </ul>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {{ order.total_amount | number:'1.0-0' }} F CFA
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <select [(ngModel)]="order.status" (change)="updateStatus(order)" 
                    class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm rounded-md"
                    [ngClass]="{
                      'bg-yellow-100 text-yellow-800': order.status === 'PENDING',
                      'bg-blue-100 text-blue-800': order.status === 'VALIDATED',
                      'bg-purple-100 text-purple-800': order.status === 'SHIPPING',
                      'bg-green-100 text-green-800': order.status === 'DELIVERED',
                      'bg-red-100 text-red-800': order.status === 'CANCELLED'
                    }">
                    <option value="PENDING">En attente</option>
                    <option value="VALIDATED">Validée</option>
                    <option value="SHIPPING">En cours de livraison</option>
                    <option value="DELIVERED">Livrée</option>
                    <option value="CANCELLED">Annulée</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Prévisions IA -->
      <div *ngIf="!loading && forecast.length > 0" class="bg-white shadow sm:rounded-lg p-6">
        <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <svg class="w-6 h-6 text-brand mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
          Prévisions de stock (IA Prophet) - 30 Jours
        </h3>
        <p class="text-sm text-gray-500 mb-6">Simulation de l'évolution des commandes pour le mois prochain basée sur vos données de vente historiques.</p>
        
        <div class="h-64 flex items-end space-x-1 pb-4 relative border-b border-l border-gray-200">
          <div *ngFor="let data of forecast; let i = index" class="relative group flex-1 flex flex-col justify-end">
            <div class="w-full bg-brand hover:bg-brand-dark rounded-t-sm transition-all cursor-pointer"
                 [style.height.%]="(data.yhat / maxForecastValue) * 100">
            </div>
            <!-- Tooltip -->
            <div class="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 transition-opacity pointer-events-none">
              {{ data.ds | date:'dd/MM' }} : {{ data.yhat }} ventes
            </div>
          </div>
        </div>
        <div class="flex justify-between text-xs text-gray-500 mt-2">
          <span>Aujourd'hui</span>
          <span>Dans 30 jours</span>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  orders: Order[] = [];
  forecast: any[] = [];
  maxForecastValue: number = 100;
  loading = true;

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadOrders();
    this.loadForecast();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des commandes', err);
        this.loading = false;
        if (err.status === 401) {
          this.authService.logout();
        }
      }
    });
  }

  loadForecast() {
    this.orderService.getForecast().subscribe({
      next: (data) => {
        if (data && data.forecast) {
          this.forecast = data.forecast;
          this.maxForecastValue = Math.max(...this.forecast.map(f => f.yhat)) || 100;
        }
      },
      error: (err) => console.error('Error fetching forecast', err)
    });
  }

  updateStatus(order: Order) {
    this.orderService.updateOrderStatus(order.id!, order.status).subscribe({
      next: (updatedOrder) => {
        // Optionally show a toast notification
        console.log('Status updated', updatedOrder);
      },
      error: (err) => {
        console.error('Erreur de mise à jour du statut', err);
        alert('Impossible de mettre à jour le statut.');
        this.loadOrders(); // Revert back
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
