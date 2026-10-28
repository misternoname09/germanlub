import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-manager-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h1 class="text-2xl font-semibold text-gray-900 mb-6">Gestion des Commandes</h1>
      
      <div *ngIf="loading" class="text-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>

      <div *ngIf="!loading && orders.length === 0" class="text-center py-10 bg-white shadow rounded-lg">
        <p class="text-gray-500">Aucune commande n'a été trouvée.</p>
      </div>

      <div *ngIf="!loading && orders.length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg">
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
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
                      <svg class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div class="ml-4">
                      <div class="flex items-center space-x-2">
                        <div class="text-sm font-medium text-gray-900">
                          Commande {{ order.invoice_number || '#' + order.id }}
                        </div>
                        <span *ngIf="order.is_quote" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          DEVIS
                        </span>
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ order.created_at | date:'dd/MM/yyyy HH:mm' }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ order.customer_name }}</div>
                  <div class="text-sm text-gray-500">{{ order.customer_phone }}</div>
                  <div class="text-sm text-gray-500">{{ order.customer_email }}</div>
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
                  <div class="flex flex-col space-y-2">
                    <select [(ngModel)]="order.status" (change)="updateStatus(order)" 
                      class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand focus:border-brand sm:text-sm rounded-md"
                      [ngClass]="{
                        'bg-yellow-100 text-yellow-800': order.status === 'PENDING',
                        'bg-blue-100 text-blue-800': order.status === 'VALIDATED',
                        'bg-purple-100 text-purple-800': order.status === 'SHIPPING',
                        'bg-green-100 text-green-800': order.status === 'DELIVERED',
                        'bg-red-100 text-red-800': order.status === 'CANCELLED'
                      }">
                      <option value="PENDING">En attente</option>
                      <option value="VALIDATED">Validée</option>
                      <option value="SHIPPING">En livraison</option>
                      <option value="DELIVERED">Livrée</option>
                      <option value="CANCELLED">Annulée</option>
                    </select>
                    <button *ngIf="order.status === 'VALIDATED' || order.status === 'SHIPPING' || order.status === 'DELIVERED'"
                      (click)="downloadInvoice(order.id!)"
                      class="inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors">
                      📥 {{ order.is_quote ? 'Devis' : 'Facture' }}
                    </button>
                    <button *ngIf="order.status === 'VALIDATED' || order.status === 'SHIPPING' || order.status === 'DELIVERED'"
                      (click)="downloadDeliverySlip(order.id!)"
                      class="inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-colors">
                      📋 Bordereau
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ManagerOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur', err);
        this.loading = false;
      }
    });
  }

  updateStatus(order: Order) {
    this.orderService.updateOrderStatus(order.id!, order.status).subscribe({
      next: (updatedOrder) => {
        if (updatedOrder.status === 'VALIDATED') {
          alert('Commande validée ! Une facture PDF a été générée et envoyée par e-mail.');
        }
      },
      error: (err) => {
        alert('Erreur lors de la mise à jour du statut.');
        this.loadOrders();
      }
    });
  }

  downloadInvoice(orderId: number) {
    this.orderService.downloadInvoice(orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture_germanlub_${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      },
      error: (err) => {
        alert('Erreur : La facture n\'a pas pu être trouvée ou générée.');
      }
    });
  }

  downloadDeliverySlip(orderId: number) {
    this.orderService.downloadDeliverySlip(orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bordereau_germanlub_${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      },
      error: (err) => {
        alert('Erreur : Le bordereau n\'a pas pu être trouvé ou généré.');
      }
    });
  }
}
