import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-manager-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Codes Promo</h1>
        <button (click)="openCreateModal()" class="bg-brand text-white px-4 py-2 rounded shadow hover:bg-brand-dark transition">
          + Nouveau Code
        </button>
      </div>

      <div *ngIf="loading" class="text-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>

      <div *ngIf="!loading && coupons.length === 0" class="text-center py-10 bg-white shadow rounded-lg">
        <p class="text-gray-500">Aucun code promo trouvé.</p>
      </div>

      <div *ngIf="!loading && coupons.length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="overflow-x-auto w-full">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Réduction (%)</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiration</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let coupon of coupons">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{{ coupon.code }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">- {{ coupon.discount_percent }} %</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span (click)="toggleActive(coupon)" class="cursor-pointer inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="{'bg-green-100 text-green-800': coupon.active, 'bg-red-100 text-red-800': !coupon.active}">
                    {{ coupon.active ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ coupon.valid_until | date:'dd/MM/yyyy' || 'Illimité' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button (click)="deleteCoupon(coupon.id)" class="text-red-600 hover:text-red-900">Supprimer</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Modal Create -->
      <div *ngIf="showModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="closeModal()"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Créer un Code Promo
              </h3>
              <div class="mt-4">
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700">Code (ex: NOEL20)</label>
                  <input type="text" [(ngModel)]="newCoupon.code" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border text-gray-900 bg-white" style="text-transform: uppercase;">
                </div>
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700">Réduction (%)</label>
                  <input type="number" [(ngModel)]="newCoupon.discount_percent" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border text-gray-900 bg-white">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Date d'expiration (optionnel)</label>
                  <input type="datetime-local" [(ngModel)]="newCoupon.valid_until" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border text-gray-900 bg-white">
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="button" (click)="saveCoupon()" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand text-base font-medium text-white hover:bg-brand-dark sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                Sauvegarder
              </button>
              <button type="button" (click)="closeModal()" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class ManagerCouponsComponent implements OnInit {
  coupons: any[] = [];
  loading = true;
  showModal = false;
  newCoupon = { code: '', discount_percent: 10, active: true, valid_until: null };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCoupons();
  }

  loadCoupons() {
    this.loading = true;
    this.http.get<any[]>(`${environment.apiUrl}/coupons/`).subscribe({
      next: (data) => {
        this.coupons = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  toggleActive(coupon: any) {
    const newStatus = !coupon.active;
    this.http.patch(`${environment.apiUrl}/coupons/${coupon.id}/`, { active: newStatus }).subscribe({
      next: () => coupon.active = newStatus,
      error: () => alert('Erreur lors de la modification du statut')
    });
  }

  openCreateModal() {
    this.newCoupon = { code: '', discount_percent: 10, active: true, valid_until: null };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveCoupon() {
    if (!this.newCoupon.code || !this.newCoupon.discount_percent) return;
    
    // Format code uppercase
    this.newCoupon.code = this.newCoupon.code.toUpperCase();
    
    this.http.post(`${environment.apiUrl}/coupons/`, this.newCoupon).subscribe({
      next: () => {
        this.closeModal();
        this.loadCoupons();
      },
      error: (err) => alert('Erreur lors de la création')
    });
  }

  deleteCoupon(id: number) {
    if(confirm("Êtes-vous sûr de vouloir supprimer ce code promo ?")) {
      this.http.delete(`${environment.apiUrl}/coupons/${id}/`).subscribe({
        next: () => this.loadCoupons(),
        error: () => alert('Erreur lors de la suppression')
      });
    }
  }
}
