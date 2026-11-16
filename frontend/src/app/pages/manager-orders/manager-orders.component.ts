import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OrderService, Order } from '../../services/order.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-manager-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 class="text-2xl font-semibold text-gray-900">Gestion des Commandes</h1>
        <div class="flex flex-wrap gap-3">
          <button (click)="exportCsv()" [disabled]="exporting"
            class="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700 disabled:bg-gray-400 transition flex items-center text-sm font-medium">
            📊 {{ exporting ? 'Export...' : 'Exporter (Excel / CSV)' }}
          </button>
          <button (click)="openManualModal()"
            class="bg-brand text-white px-4 py-2 rounded shadow hover:bg-brand-dark transition text-sm font-medium">
            + Créer Facture / Devis
          </button>
        </div>
      </div>
      
      <div *ngIf="loading" class="text-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>

      <div *ngIf="!loading && orders.length === 0" class="text-center py-10 bg-white shadow rounded-lg">
        <p class="text-gray-500">Aucune commande n'a été trouvée.</p>
      </div>

      <div *ngIf="!loading && orders.length > 0" class="space-y-4">
        <!-- Barre de recherche et filtres -->
        <div class="bg-white p-4 shadow rounded-lg flex flex-col md:flex-row gap-4 items-center justify-between">
          <div class="w-full md:w-1/2 relative">
            <input type="text" [(ngModel)]="searchTerm" placeholder="Rechercher par client, téléphone, e-mail ou N° facture..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand focus:border-brand text-sm">
            <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <div class="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <select [(ngModel)]="typeFilter" class="border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-brand focus:border-brand">
              <option value="ALL">Tous types (Commandes & Devis)</option>
              <option value="ORDER">Commandes uniquement</option>
              <option value="QUOTE">Devis uniquement</option>
            </select>
            <select [(ngModel)]="statusFilter" class="border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-brand focus:border-brand">
              <option value="ALL">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="VALIDATED">Validée</option>
              <option value="SHIPPING">En livraison</option>
              <option value="DELIVERED">Livrée</option>
              <option value="CANCELLED">Annulée</option>
            </select>
          </div>
        </div>

        <div *ngIf="filteredOrders.length === 0" class="text-center py-10 bg-white shadow rounded-lg">
          <p class="text-gray-500">Aucune commande ne correspond à vos filtres.</p>
        </div>

        <div *ngIf="filteredOrders.length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg">
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
                <tr *ngFor="let order of filteredOrders">
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
                    <button *ngIf="order.status !== 'CANCELLED'"
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

      <!-- Modal Création Facture / Devis Manuel -->
      <div *ngIf="showManualModal" class="fixed z-20 inset-0 overflow-y-auto" aria-labelledby="manual-modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="closeManualModal()"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
              <h3 class="text-lg leading-6 font-bold text-gray-900 mb-4" id="manual-modal-title">
                Créer une Facture ou un Devis manuel
              </h3>

              <!-- Type de document -->
              <div class="mb-4 flex gap-3">
                <button type="button" (click)="manualOrder.is_quote = false"
                  [ngClass]="!manualOrder.is_quote ? 'bg-brand text-white border-brand' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                  class="flex-1 py-2 px-4 border rounded-md text-sm font-medium transition-colors">
                  Facture (Vente validée)
                </button>
                <button type="button" (click)="manualOrder.is_quote = true"
                  [ngClass]="manualOrder.is_quote ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                  class="flex-1 py-2 px-4 border rounded-md text-sm font-medium transition-colors">
                  Devis Client
                </button>
              </div>

              <!-- Informations Client -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Nom du client *</label>
                  <input type="text" [(ngModel)]="manualOrder.customer_name" placeholder="Ex: Entreprise / Client"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border text-gray-900 bg-white">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Téléphone *</label>
                  <input type="tel" [(ngModel)]="manualOrder.customer_phone" placeholder="Ex: 77 123 45 67"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border text-gray-900 bg-white">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">E-mail (optionnel)</label>
                  <input type="email" [(ngModel)]="manualOrder.customer_email" placeholder="client@exemple.com"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border text-gray-900 bg-white">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Adresse</label>
                  <input type="text" [(ngModel)]="manualOrder.customer_address" placeholder="Dakar, Sénégal"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border text-gray-900 bg-white">
                </div>
              </div>

              <!-- Lignes de produits -->
              <div class="border-t border-gray-200 pt-4">
                <div class="flex justify-between items-center mb-2">
                  <label class="block text-sm font-bold text-gray-700">Produits</label>
                  <button type="button" (click)="addManualItem()" class="text-sm text-brand hover:text-brand-dark font-medium">
                    + Ajouter un produit
                  </button>
                </div>

                <div class="space-y-3 max-h-60 overflow-y-auto pr-1">
                  <div *ngFor="let item of manualItems; let i = index" class="grid grid-cols-12 gap-2 items-center bg-gray-50 p-2 rounded">
                    <div class="col-span-12 sm:col-span-6">
                      <select [(ngModel)]="item.product_id" (ngModelChange)="onProductSelect(item)"
                        class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border text-gray-900 bg-white">
                        <option [ngValue]="null">-- Choisir un produit --</option>
                        <option *ngFor="let p of products" [ngValue]="p.id">{{ p.name }} ({{ p.stock }} en stock)</option>
                      </select>
                    </div>
                    <div class="col-span-4 sm:col-span-2">
                      <input type="number" min="1" [(ngModel)]="item.quantity" placeholder="Qté"
                        class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border text-gray-900 bg-white">
                    </div>
                    <div class="col-span-6 sm:col-span-3">
                      <input type="number" min="0" [(ngModel)]="item.price" placeholder="Prix unit."
                        class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border text-gray-900 bg-white">
                    </div>
                    <div class="col-span-2 sm:col-span-1 text-right">
                      <button *ngIf="manualItems.length > 1" type="button" (click)="removeManualItem(i)" class="text-red-600 hover:text-red-800 font-bold px-2">
                        ✕
                      </button>
                    </div>
                  </div>
                </div>

                <div class="mt-4 flex justify-between items-center bg-gray-100 p-3 rounded-md">
                  <span class="text-sm font-semibold text-gray-700">Total estimé :</span>
                  <span class="text-xl font-bold text-brand">{{ manualTotal | number:'1.0-0' }} F CFA</span>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="button" (click)="saveManualOrder()" [disabled]="savingManual || !isManualFormValid"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand text-base font-medium text-white hover:bg-brand-dark disabled:bg-gray-300 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                {{ savingManual ? 'Création...' : 'Créer & Télécharger le PDF' }}
              </button>
              <button type="button" (click)="closeManualModal()"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ManagerOrdersComponent implements OnInit {
  orders: Order[] = [];
  products: any[] = [];
  loading = true;
  exporting = false;
  searchTerm: string = '';
  statusFilter: string = 'ALL';
  typeFilter: string = 'ALL';

  showManualModal = false;
  savingManual = false;
  manualOrder = {
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: 'Dakar, Sénégal',
    is_quote: false
  };
  manualItems: { product_id: number | null; quantity: number; price: number }[] = [
    { product_id: null, quantity: 1, price: 0 }
  ];

  constructor(private orderService: OrderService, private http: HttpClient) {}

  get filteredOrders(): Order[] {
    const q = this.searchTerm.trim().toLowerCase();
    return this.orders.filter(order => {
      if (this.statusFilter !== 'ALL' && order.status !== this.statusFilter) {
        return false;
      }
      if (this.typeFilter === 'ORDER' && order.is_quote) {
        return false;
      }
      if (this.typeFilter === 'QUOTE' && !order.is_quote) {
        return false;
      }
      if (q) {
        const haystack = [
          order.customer_name,
          order.customer_phone,
          order.customer_email || '',
          order.invoice_number || `#${order.id}`
        ].join(' ').toLowerCase();
        if (!haystack.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }

  ngOnInit() {
    this.loadOrders();
    this.loadProducts();
  }

  loadProducts() {
    this.http.get<any[]>(`${environment.apiUrl}/products/`).subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => console.error('Erreur chargement produits', err)
    });
  }

  exportCsv() {
    this.exporting = true;
    this.orderService.exportOrdersCsv().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'commandes_germanlub.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        this.exporting = false;
      },
      error: () => {
        this.exporting = false;
        alert('Erreur lors de l\'exportation des commandes.');
      }
    });
  }

  openManualModal() {
    this.manualOrder = {
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      customer_address: 'Dakar, Sénégal',
      is_quote: false
    };
    this.manualItems = [{ product_id: null, quantity: 1, price: 0 }];
    this.showManualModal = true;
  }

  closeManualModal() {
    this.showManualModal = false;
  }

  addManualItem() {
    this.manualItems.push({ product_id: null, quantity: 1, price: 0 });
  }

  removeManualItem(index: number) {
    if (this.manualItems.length > 1) {
      this.manualItems.splice(index, 1);
    }
  }

  onProductSelect(item: { product_id: number | null; quantity: number; price: number }) {
    const prod = this.products.find(p => p.id === Number(item.product_id));
    if (prod) {
      item.price = Number(prod.price);
    }
  }

  get manualTotal(): number {
    return this.manualItems.reduce(
      (sum, it) => sum + ((Number(it.price) || 0) * (Number(it.quantity) || 0)),
      0
    );
  }

  get isManualFormValid(): boolean {
    if (!this.manualOrder.customer_name.trim() || !this.manualOrder.customer_phone.trim()) {
      return false;
    }
    return this.manualItems.some(it => it.product_id !== null && Number(it.quantity) > 0);
  }

  saveManualOrder() {
    if (!this.isManualFormValid) return;
    const validItems = this.manualItems.filter(it => it.product_id !== null && Number(it.quantity) > 0);
    if (validItems.length === 0) return;

    this.savingManual = true;
    const payload = {
      customer_name: this.manualOrder.customer_name.trim(),
      customer_phone: this.manualOrder.customer_phone.trim(),
      customer_email: this.manualOrder.customer_email.trim(),
      customer_address: this.manualOrder.customer_address.trim() || 'Dakar, Sénégal',
      is_quote: this.manualOrder.is_quote,
      status: this.manualOrder.is_quote ? 'PENDING' : 'VALIDATED',
      items: validItems.map(it => ({
        product_id: Number(it.product_id),
        quantity: Number(it.quantity),
        price: Number(it.price)
      }))
    };

    this.orderService.createOrder(payload).subscribe({
      next: (created) => {
        this.orders = [created, ...this.orders];
        this.savingManual = false;
        this.closeManualModal();
        this.loadProducts();
        if (created.id) {
          this.downloadInvoice(created.id);
        }
      },
      error: (err) => {
        this.savingManual = false;
        const msg = err?.error?.error || 'Erreur lors de la création de la facture/devis.';
        alert(msg);
      }
    });
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders = [...data].sort((a, b) =>
          (new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()) || ((b.id || 0) - (a.id || 0))
        );
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
