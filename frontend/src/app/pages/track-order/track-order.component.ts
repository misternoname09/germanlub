import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden md:max-w-2xl transition-colors duration-300">
        <div class="md:flex">
          <div class="p-8 w-full">
            <div class="uppercase tracking-wide text-sm text-brand font-semibold mb-1">Suivi de Commande</div>
            <h1 class="block mt-1 text-lg leading-tight font-medium text-black dark:text-white mb-6">
              Où en est ma commande ?
            </h1>
            
            <form (ngSubmit)="trackOrder()" class="mb-8">
              <div class="flex items-center border-b border-brand py-2">
                <input class="appearance-none bg-transparent border-none w-full text-gray-700 dark:text-gray-300 mr-3 py-1 px-2 leading-tight focus:outline-none" 
                       type="text" 
                       placeholder="Ex: LES/GERM26-001" 
                       [(ngModel)]="invoiceNumber" 
                       name="invoiceNumber"
                       required>
                <button class="flex-shrink-0 bg-brand hover:bg-brand-dark border-brand hover:border-brand-dark text-sm border-4 text-white py-1 px-2 rounded transition-colors" 
                        type="submit" 
                        [disabled]="loading">
                  {{ loading ? 'Recherche...' : 'Suivre' }}
                </button>
              </div>
            </form>

            <!-- Message d'erreur -->
            <div *ngIf="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <span class="block sm:inline">{{ error }}</span>
            </div>

            <!-- Résultat -->
            <div *ngIf="order" class="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Détails de la commande</h3>
              <p class="text-gray-700 dark:text-gray-300 mb-2"><span class="font-semibold">Facture :</span> {{ order.invoice_number }}</p>
              <p class="text-gray-700 dark:text-gray-300 mb-2"><span class="font-semibold">Client :</span> {{ order.customer_name }}</p>
              <p class="text-gray-700 dark:text-gray-300 mb-4"><span class="font-semibold">Montant :</span> {{ order.total_amount }} F CFA</p>
              
              <div class="mt-6">
                <h4 class="font-semibold text-gray-900 dark:text-white mb-3">Statut actuel :</h4>
                <div class="relative pt-1">
                  <div class="flex mb-2 items-center justify-between">
                    <div>
                      <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full"
                            [ngClass]="getStatusColor(order.status)">
                        {{ getStatusText(order.status) }}
                      </span>
                    </div>
                  </div>
                  <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-600">
                    <div [style.width]="getProgressWidth(order.status)" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
                         [ngClass]="getProgressBarColor(order.status)"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class TrackOrderComponent {
  invoiceNumber: string = '';
  loading: boolean = false;
  error: string = '';
  order: any = null;

  constructor(private http: HttpClient) {}

  trackOrder() {
    if (!this.invoiceNumber.trim()) {
      this.error = "Veuillez entrer un numéro de facture valide.";
      return;
    }
    this.loading = true;
    this.error = '';
    this.order = null;

    this.http.post<any>(`${environment.apiUrl}/orders/track/`, { invoice_number: this.invoiceNumber })
      .subscribe({
        next: (data) => {
          this.order = data;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          if (err.status === 404) {
            this.error = "Aucune commande trouvée avec ce numéro.";
          } else {
            this.error = "Une erreur est survenue lors de la recherche.";
          }
        }
      });
  }

  getStatusText(status: string): string {
    const statuses: any = {
      'PENDING': 'En attente de validation',
      'VALIDATED': 'Validée / Préparation',
      'SHIPPING': 'En cours de livraison',
      'DELIVERED': 'Livrée',
      'CANCELLED': 'Annulée'
    };
    return statuses[status] || status;
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'PENDING': return 'text-yellow-800 bg-yellow-200';
      case 'VALIDATED': return 'text-blue-800 bg-blue-200';
      case 'SHIPPING': return 'text-purple-800 bg-purple-200';
      case 'DELIVERED': return 'text-green-800 bg-green-200';
      case 'CANCELLED': return 'text-red-800 bg-red-200';
      default: return 'text-gray-800 bg-gray-200';
    }
  }

  getProgressBarColor(status: string): string {
    switch(status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'VALIDATED': return 'bg-blue-500';
      case 'SHIPPING': return 'bg-purple-500';
      case 'DELIVERED': return 'bg-green-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }

  getProgressWidth(status: string): string {
    switch(status) {
      case 'PENDING': return '25%';
      case 'VALIDATED': return '50%';
      case 'SHIPPING': return '75%';
      case 'DELIVERED': return '100%';
      case 'CANCELLED': return '100%';
      default: return '0%';
    }
  }
}
