import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-manager-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Gestion des Produits & Stocks</h1>
        <div class="flex space-x-3">
          <button (click)="downloadInventory()" class="bg-gray-800 text-white px-4 py-2 rounded shadow hover:bg-gray-700 transition flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Tirer l'Inventaire
          </button>
          <button (click)="openCreateModal()" class="bg-brand text-white px-4 py-2 rounded shadow hover:bg-brand-dark transition">
            + Nouveau Produit
          </button>
        </div>
      </div>
      
      <!-- KPIs Inventaire -->
      <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-brand">
          <p class="text-sm text-gray-500 font-medium">Valeur Totale du Stock</p>
          <p class="text-2xl font-bold text-gray-900">{{ totalInventoryValue | number:'1.0-0' }} F CFA</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p class="text-sm text-gray-500 font-medium">Total Articles (Volume)</p>
          <p class="text-2xl font-bold text-gray-900">{{ totalItems }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow border-l-4" [ngClass]="lowStockCount > 0 ? 'border-red-500' : 'border-green-500'">
          <p class="text-sm text-gray-500 font-medium">Alerte Rupture (Stock ≤ 5)</p>
          <p class="text-2xl font-bold" [ngClass]="lowStockCount > 0 ? 'text-red-600' : 'text-green-600'">
            {{ lowStockCount }} produit(s)
          </p>
        </div>
      </div>
      
      <div *ngIf="loading" class="text-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>

      <div *ngIf="!loading && products.length === 0" class="text-center py-10 bg-white shadow rounded-lg">
        <p class="text-gray-500">Aucun produit trouvé.</p>
      </div>

      <div *ngIf="!loading && products.length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="overflow-x-auto w-full">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix (F CFA)</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let product of products">
                <td class="px-6 py-4 whitespace-nowrap flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md overflow-hidden">
                    <img *ngIf="product.image" [src]="product.image" alt="" class="h-10 w-10 object-cover">
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                    <div class="text-sm text-gray-500 line-clamp-1 w-48">{{ product.description }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <input type="number" [(ngModel)]="product.editPrice" 
                    class="block w-24 border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm text-gray-900 bg-white">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <input type="number" [(ngModel)]="product.editStock" 
                    class="block w-20 border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm text-gray-900 bg-white"
                    [ngClass]="{'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500': product.editStock <= 5}">
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button (click)="openEditModal(product)" class="text-indigo-600 hover:text-indigo-900 mr-3">Modifier</button>
                  <button (click)="deleteProduct(product.id)" class="text-red-600 hover:text-red-900 mr-3">Supprimer</button>
                  <button (click)="saveProduct(product)" 
                    [disabled]="product.saving || (product.editPrice == product.price && product.editStock == product.stock)"
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:bg-gray-300 transition-colors">
                    <span *ngIf="!product.saving">Sauver (Rapide)</span>
                    <span *ngIf="product.saving" class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                  </button>
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
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                {{ isEditing ? 'Modifier le Produit' : 'Créer un Produit' }}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Nom du produit</label>
                  <input type="text" [(ngModel)]="newProduct.name" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border text-gray-900 bg-white">
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700">Description</label>
                  <textarea [(ngModel)]="newProduct.description" rows="3" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border text-gray-900 bg-white"></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Catégorie</label>
                  <select [(ngModel)]="newProduct.category_id" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border bg-white text-gray-900">
                    <option [ngValue]="null">Aucune</option>
                    <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Prix (F CFA)</label>
                  <input type="number" [(ngModel)]="newProduct.price" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border text-gray-900 bg-white">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Stock initial</label>
                  <input type="number" [(ngModel)]="newProduct.stock" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border text-gray-900 bg-white">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Image du produit</label>
                  <input type="file" (change)="onFileSelected($event)" accept="image/*" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand file:text-white hover:file:bg-brand-dark">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Fiche technique (PDF)</label>
                  <input type="file" (change)="onPdfSelected($event)" accept=".pdf" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200">
                </div>
                
                <!-- Nouveaux champs pour les filtres -->
                <div>
                  <label class="block text-sm font-medium text-gray-700">Viscosité (ex: SAE 50, 15W40)</label>
                  <input type="text" [(ngModel)]="newProduct.viscosity" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border text-gray-900 bg-white">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Véhicule cible</label>
                  <select [(ngModel)]="newProduct.vehicle_type" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border bg-white text-gray-900">
                    <option value="Tous">Tous les véhicules</option>
                    <option value="Tourisme">Véhicules de tourisme</option>
                    <option value="Poids lourd">Poids lourds</option>
                    <option value="Moto">Motos</option>
                    <option value="Utilitaires">Véhicules utilitaires</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Motorisation</label>
                  <select [(ngModel)]="newProduct.engine_type" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border bg-white text-gray-900">
                    <option value="Tous">Toutes motorisations</option>
                    <option value="Essence">Essence</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybride">Hybride</option>
                  </select>
                </div>

              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="button" (click)="saveNewProduct()" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand text-base font-medium text-white hover:bg-brand-dark sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                {{ isEditing ? 'Enregistrer les modifications' : 'Créer' }}
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
export class ManagerProductsComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  loading = true;
  showModal = false;
  isEditing = false;
  editingProductId: number | null = null;
  selectedFile: File | null = null;
  selectedPdfFile: File | null = null;
  
  // KPIs
  totalInventoryValue = 0;
  totalItems = 0;
  lowStockCount = 0;

  newProduct: any = { name: '', description: '', price: 0, stock: 0, category_id: null, viscosity: '', vehicle_type: 'Tous', engine_type: 'Tous' };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadCategories() {
    this.http.get<any[]>(`${environment.apiUrl}/categories/`).subscribe(data => {
      this.categories = data;
    });
  }

  loadProducts() {
    this.http.get<any[]>(`${environment.apiUrl}/products/`).subscribe({
      next: (data) => {
        this.products = data.map(p => ({
          ...p,
          editPrice: parseFloat(p.price),
          editStock: p.stock,
          saving: false
        }));
        this.computeKPIs();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.loading = false;
      }
    });
  }

  computeKPIs() {
    this.totalInventoryValue = this.products.reduce((sum, p) => sum + (p.editPrice * p.editStock), 0);
    this.totalItems = this.products.reduce((sum, p) => sum + p.editStock, 0);
    this.lowStockCount = this.products.filter(p => p.editStock <= 5).length;
  }

  saveProduct(product: any) {
    product.saving = true;
    
    // We only patch price and stock
    const payload = {
      price: product.editPrice,
      stock: product.editStock
    };

    this.http.patch<any>(`${environment.apiUrl}/products/${product.id}/`, payload).subscribe({
      next: (updated) => {
        product.price = updated.price;
        product.stock = updated.stock;
        product.saving = false;
        this.computeKPIs();
      },
      error: (err) => {
        alert('Erreur lors de la sauvegarde du produit.');
        product.saving = false;
      }
    });
  }

  openCreateModal() {
    this.isEditing = false;
    this.editingProductId = null;
    this.newProduct = { name: '', description: '', price: 0, stock: 0, category_id: null, viscosity: '', vehicle_type: 'Tous', engine_type: 'Tous' };
    this.selectedFile = null;
    this.selectedPdfFile = null;
    this.showModal = true;
  }

  openEditModal(product: any) {
    this.isEditing = true;
    this.editingProductId = product.id;
    this.newProduct = { 
      name: product.name, 
      description: product.description, 
      price: product.price, 
      stock: product.stock, 
      category_id: product.category ? product.category.id : null,
      viscosity: product.viscosity || '',
      vehicle_type: product.vehicle_type || 'Tous',
      engine_type: product.engine_type || 'Tous'
    };
    this.selectedFile = null;
    this.selectedPdfFile = null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onPdfSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedPdfFile = event.target.files[0];
    }
  }

  saveNewProduct() {
    if (!this.newProduct.name || !this.newProduct.price) return;
    
    const formData = new FormData();
    formData.append('name', this.newProduct.name);
    formData.append('description', this.newProduct.description);
    formData.append('price', this.newProduct.price);
    formData.append('stock', this.newProduct.stock);
    if (this.newProduct.viscosity) formData.append('viscosity', this.newProduct.viscosity);
    if (this.newProduct.vehicle_type) formData.append('vehicle_type', this.newProduct.vehicle_type);
    if (this.newProduct.engine_type) formData.append('engine_type', this.newProduct.engine_type);

    if (this.newProduct.category_id) {
      formData.append('category_id', this.newProduct.category_id);
    }
    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }
    if (this.selectedPdfFile) {
      formData.append('technical_sheet', this.selectedPdfFile, this.selectedPdfFile.name);
    }

    if (this.isEditing && this.editingProductId) {
      this.http.patch(`${environment.apiUrl}/products/${this.editingProductId}/`, formData).subscribe({
        next: () => {
          this.closeModal();
          this.loadProducts();
        },
        error: (err) => alert('Erreur lors de la modification')
      });
    } else {
      this.http.post(`${environment.apiUrl}/products/`, formData).subscribe({
        next: () => {
          this.closeModal();
          this.loadProducts();
        },
        error: (err) => alert('Erreur lors de la création')
      });
    }
  }

  deleteProduct(id: number) {
    if(confirm("Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.")) {
      this.http.delete(`${environment.apiUrl}/products/${id}/`).subscribe({
        next: () => this.loadProducts(),
        error: () => alert('Erreur lors de la suppression')
      });
    }
  }

  downloadInventory() {
    this.http.get(`${environment.apiUrl}/products/inventory_report/`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventaire_germanlub.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      },
      error: (err) => alert('Erreur lors du téléchargement de l\'inventaire.')
    });
  }
}
