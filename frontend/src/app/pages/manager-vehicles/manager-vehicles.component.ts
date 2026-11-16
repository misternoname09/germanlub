import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-manager-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 class="text-2xl font-semibold text-gray-900">Gestion des Véhicules &amp; Huiles Recommandées</h1>
        <button (click)="openCreateModal()" class="bg-brand text-white px-4 py-2 rounded shadow hover:bg-brand-dark transition">
          + Nouveau Véhicule
        </button>
      </div>

      <!-- Barre de recherche -->
      <div *ngIf="!loading && vehicles.length > 0" class="bg-white p-4 shadow rounded-lg mb-4">
        <div class="relative w-full md:w-1/2">
          <input type="text" [(ngModel)]="searchTerm" placeholder="Rechercher par marque, modèle, moteur ou huile..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand focus:border-brand text-sm text-gray-900 bg-white">
          <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      <div *ngIf="loading" class="text-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>

      <div *ngIf="!loading && filteredVehicles.length === 0" class="text-center py-10 bg-white shadow rounded-lg">
        <p class="text-gray-500">Aucun véhicule trouvé.</p>
      </div>

      <div *ngIf="!loading && filteredVehicles.length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="overflow-x-auto w-full">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marque</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modèle</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motorisation</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Huiles recommandées</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let vehicle of filteredVehicles">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ vehicle.make }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ vehicle.model_name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ vehicle.engine }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  <div class="flex flex-wrap gap-1">
                    <span *ngFor="let name of (vehicle.recommended_product_names || [])"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {{ name }}
                    </span>
                    <span *ngIf="!vehicle.recommended_product_names || vehicle.recommended_product_names.length === 0" class="text-gray-400 italic text-xs">
                      Aucune huile associée
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button (click)="openEditModal(vehicle)" class="text-indigo-600 hover:text-indigo-900 mr-4">Modifier</button>
                  <button (click)="deleteVehicle(vehicle.id)" class="text-red-600 hover:text-red-900">Supprimer</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Create / Edit -->
      <div *ngIf="showModal" class="fixed z-20 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="closeModal()"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                {{ isEditing ? 'Modifier le Véhicule' : 'Ajouter un Véhicule' }}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Marque *</label>
                  <input type="text" [(ngModel)]="currentVehicle.make" placeholder="Ex: Toyota"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border text-gray-900 bg-white">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Modèle *</label>
                  <input type="text" [(ngModel)]="currentVehicle.model_name" placeholder="Ex: Hilux"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border text-gray-900 bg-white">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Motorisation *</label>
                  <input type="text" [(ngModel)]="currentVehicle.engine" placeholder="Ex: 2.5 D-4D"
                    class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border text-gray-900 bg-white">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Huiles recommandées pour ce véhicule</label>
                <div class="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3 space-y-2 bg-gray-50">
                  <label *ngFor="let prod of products" class="flex items-center space-x-3 p-2 rounded hover:bg-white cursor-pointer">
                    <input type="checkbox"
                      [checked]="isProductSelected(prod.id)"
                      (change)="toggleProductSelection(prod.id)"
                      class="h-4 w-4 text-brand focus:ring-brand border-gray-300 rounded">
                    <span class="text-sm text-gray-900 font-medium">{{ prod.name }}</span>
                    <span *ngIf="prod.viscosity" class="text-xs text-gray-500">({{ prod.viscosity }})</span>
                  </label>
                  <p *ngIf="products.length === 0" class="text-sm text-gray-500">Aucun produit disponible.</p>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="button" (click)="saveVehicle()" [disabled]="saving || !currentVehicle.make || !currentVehicle.model_name || !currentVehicle.engine"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand text-base font-medium text-white hover:bg-brand-dark disabled:bg-gray-300 sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                {{ saving ? 'Enregistrement...' : 'Sauvegarder' }}
              </button>
              <button type="button" (click)="closeModal()"
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
export class ManagerVehiclesComponent implements OnInit {
  vehicles: any[] = [];
  products: any[] = [];
  loading = true;
  saving = false;
  showModal = false;
  isEditing = false;
  editingId: number | null = null;
  searchTerm = '';

  currentVehicle: {
    make: string;
    model_name: string;
    engine: string;
    recommended_products: number[];
  } = {
    make: '',
    model_name: '',
    engine: '',
    recommended_products: []
  };

  constructor(private http: HttpClient) {}

  get filteredVehicles(): any[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.vehicles;
    return this.vehicles.filter(v => {
      const oils = (v.recommended_product_names || []).join(' ');
      return `${v.make} ${v.model_name} ${v.engine} ${oils}`.toLowerCase().includes(q);
    });
  }

  ngOnInit() {
    this.loadVehicles();
    this.loadProducts();
  }

  loadVehicles() {
    this.loading = true;
    this.http.get<any[]>(`${environment.apiUrl}/vehicles/`).subscribe({
      next: (data) => {
        this.vehicles = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement véhicules', err);
        this.loading = false;
      }
    });
  }

  loadProducts() {
    this.http.get<any[]>(`${environment.apiUrl}/products/`).subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => console.error('Erreur chargement produits', err)
    });
  }

  openCreateModal() {
    this.isEditing = false;
    this.editingId = null;
    this.currentVehicle = { make: '', model_name: '', engine: '', recommended_products: [] };
    this.showModal = true;
  }

  openEditModal(vehicle: any) {
    this.isEditing = true;
    this.editingId = vehicle.id;
    this.currentVehicle = {
      make: vehicle.make,
      model_name: vehicle.model_name,
      engine: vehicle.engine,
      recommended_products: [...(vehicle.recommended_products || [])]
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  isProductSelected(productId: number): boolean {
    return this.currentVehicle.recommended_products.includes(productId);
  }

  toggleProductSelection(productId: number) {
    const idx = this.currentVehicle.recommended_products.indexOf(productId);
    if (idx > -1) {
      this.currentVehicle.recommended_products.splice(idx, 1);
    } else {
      this.currentVehicle.recommended_products.push(productId);
    }
  }

  saveVehicle() {
    if (!this.currentVehicle.make || !this.currentVehicle.model_name || !this.currentVehicle.engine) return;
    this.saving = true;

    const request = this.isEditing && this.editingId
      ? this.http.put(`${environment.apiUrl}/vehicles/${this.editingId}/`, this.currentVehicle)
      : this.http.post(`${environment.apiUrl}/vehicles/`, this.currentVehicle);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadVehicles();
      },
      error: (err) => {
        console.error('Erreur sauvegarde véhicule', err);
        this.saving = false;
        alert('Erreur lors de la sauvegarde (vérifiez que ce véhicule n\'existe pas déjà).');
      }
    });
  }

  deleteVehicle(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      this.http.delete(`${environment.apiUrl}/vehicles/${id}/`).subscribe({
        next: () => this.loadVehicles(),
        error: () => alert('Erreur lors de la suppression du véhicule.')
      });
    }
  }
}

