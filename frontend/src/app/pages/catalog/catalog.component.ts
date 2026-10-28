import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe, TranslateDirective],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-200 flex flex-col md:flex-row gap-8">
      
      <!-- Sidebar Filters -->
      <aside class="w-full md:w-64 shrink-0">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">{{ 'CATALOG.FILTERS' | translate }}</h3>
          
          <div class="mb-6">
            <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-3">{{ 'CATALOG.CATEGORIES' | translate }}</h4>
            <div class="space-y-2">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="category" [value]="null" [(ngModel)]="selectedCategory" (change)="loadProducts()" class="text-brand focus:ring-brand">
                <span class="text-gray-600 dark:text-gray-400">{{ 'CATALOG.ALL_CATEGORIES' | translate }}</span>
              </label>
              <label *ngFor="let cat of categories" class="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="category" [value]="cat.id" [(ngModel)]="selectedCategory" (change)="loadProducts()" class="text-brand focus:ring-brand">
                <span class="text-gray-600 dark:text-gray-400">{{ cat.name }}</span>
              </label>
            </div>
          </div>

          <div class="mb-6">
            <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-3">Viscosité</h4>
            <select [(ngModel)]="selectedViscosity" (change)="loadProducts()" class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-brand focus:border-brand block p-2.5">
              <option [ngValue]="null">Toutes</option>
              <option *ngFor="let v of viscosities" [value]="v">{{ v }}</option>
            </select>
          </div>

          <div class="mb-6">
            <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-3">Véhicule</h4>
            <select [(ngModel)]="selectedVehicleType" (change)="loadProducts()" class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-brand focus:border-brand block p-2.5">
              <option [ngValue]="null">Tous</option>
              <option *ngFor="let vt of vehicleTypes" [value]="vt">{{ vt }}</option>
            </select>
          </div>

          <div class="mb-6">
            <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-3">Motorisation</h4>
            <select [(ngModel)]="selectedEngineType" (change)="loadProducts()" class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-brand focus:border-brand block p-2.5">
              <option [ngValue]="null">Toutes</option>
              <option *ngFor="let et of engineTypes" [value]="et">{{ et }}</option>
            </select>
          </div>

          <div>
            <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-3">{{ 'CATALOG.SORT_BY' | translate }}</h4>
            <select [(ngModel)]="sortBy" (change)="loadProducts()" class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-brand focus:border-brand block p-2.5">
              <option value="-created_at">{{ 'CATALOG.SORT_RECENT' | translate }}</option>
              <option value="price">{{ 'CATALOG.SORT_PRICE_ASC' | translate }}</option>
              <option value="-price">{{ 'CATALOG.SORT_PRICE_DESC' | translate }}</option>
            </select>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1">
        <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">
          <ng-container *ngIf="searchQuery">{{ 'CATALOG.RESULTS_FOR' | translate }} "{{ searchQuery }}"</ng-container>
          <ng-container *ngIf="selectedVehicleFilterId && !searchQuery">Huiles recommandées pour votre véhicule</ng-container>
          <ng-container *ngIf="!searchQuery && !selectedVehicleFilterId">{{ 'CATALOG.TITLE' | translate }}</ng-container>
        </h2>
        
        <div *ngIf="loading" class="text-center py-10">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          <p class="mt-2 text-gray-500 dark:text-gray-400">{{ 'CATALOG.LOADING' | translate }}</p>
        </div>

        <div *ngIf="!loading && products.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">
          {{ 'CATALOG.NO_PRODUCTS' | translate }}
        </div>

        <div class="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8 gap-x-6">
          <a *ngFor="let product of products" [routerLink]="['/product', product.id]" class="group cursor-pointer">
            <div class="w-full aspect-w-1 aspect-h-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden xl:aspect-w-7 xl:aspect-h-8 relative flex items-center justify-center p-4">
              <div *ngIf="!product.image" class="w-full h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                {{ 'CATALOG.NO_IMAGE' | translate }}
              </div>
              <img *ngIf="product.image" [src]="product.image" alt="Produit" class="w-full h-64 object-center object-contain group-hover:scale-105 transition-transform duration-300">
              <div *ngIf="product.stock === 0" class="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">{{ 'CATALOG.OUT_OF_STOCK' | translate }}</div>
            </div>
            <h3 class="mt-4 text-sm text-gray-700 dark:text-gray-300">{{ product.name }}</h3>
            <p class="mt-1 text-lg font-medium text-gray-900 dark:text-white">{{ product.price }} F CFA</p>
            
            <div *ngIf="product.stock > 0" class="mt-3 flex items-center justify-between border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-800" (click)="$event.preventDefault(); $event.stopPropagation()">
              <button type="button" (click)="decreaseQuantity(product, $event)" class="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors border-r border-gray-300 dark:border-gray-600">-</button>
              <span class="px-3 py-1 text-sm font-medium text-gray-900 dark:text-white">{{ getQuantity(product.id) }}</span>
              <button type="button" (click)="increaseQuantity(product, $event)" class="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors border-l border-gray-300 dark:border-gray-600">+</button>
            </div>

            <button (click)="addToCart(product, $event)" 
              [disabled]="product.stock === 0"
              [ngClass]="product.stock === 0 ? 'bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed' : 'bg-white dark:bg-gray-800 border-brand text-brand hover:bg-brand hover:text-white'"
              class="mt-2 w-full border transition-colors py-2 rounded-md text-sm font-medium">
              {{ product.stock === 0 ? 'Rupture de Stock' : ('CATALOG.ADD_TO_CART' | translate) }}
            </button>
          </a>
        </div>
      </div>
    </div>
  `
})
export class CatalogComponent implements OnInit {
  products: any[] = [];
  categories: any[] = [];
  loading = true;
  searchQuery: string = '';
  quantities: { [key: number]: number } = {};
  selectedCategory: number | null = null;
  selectedViscosity: string | null = null;
  selectedVehicleType: string | null = null;
  selectedEngineType: string | null = null;
  selectedVehicleFilterId: number | null = null;
  sortBy: string = '-created_at';

  viscosities = ['SAE 30', 'SAE 40', 'SAE 50', '0W20', '0W30', '5W30', '5W40', '10W40', '15W40', '20W50'];
  vehicleTypes = ['Tourisme', 'Poids lourd', 'Moto', 'Utilitaires', 'Agricole', 'Industrie', 'Engins TP'];
  engineTypes = ['Essence', 'Diesel', 'Hybride', 'Electrique'];

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.loadCategories();
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['search'] || '';
      if (params['category']) {
        this.selectedCategory = parseInt(params['category'], 10);
      }
      if (params['vehicles']) {
        this.selectedVehicleFilterId = parseInt(params['vehicles'], 10);
      } else {
        this.selectedVehicleFilterId = null;
      }
      this.loadProducts();
    });
  }

  loadCategories() {
    this.http.get<any[]>(`${environment.apiUrl}/categories/`).subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Erreur chargement catégories', err)
    });
  }

  loadProducts() {
    this.loading = true;
    let url = `${environment.apiUrl}/products/?`;

    const params = new URLSearchParams();
    if (this.searchQuery) params.append('search', this.searchQuery);
    if (this.selectedCategory) params.append('category', this.selectedCategory.toString());
    if (this.selectedViscosity) params.append('viscosity', this.selectedViscosity);
    if (this.selectedVehicleType) params.append('vehicle_type', this.selectedVehicleType);
    if (this.selectedEngineType) params.append('engine_type', this.selectedEngineType);
    if (this.selectedVehicleFilterId) params.append('vehicles', this.selectedVehicleFilterId.toString());
    if (this.sortBy) params.append('ordering', this.sortBy);

    url += params.toString();

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des produits', err);
        this.loading = false;
      }
    });
  }

  getQuantity(productId: number): number {
    return this.quantities[productId] || 1;
  }

  increaseQuantity(product: any, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const current = this.getQuantity(product.id);
    if (current < product.stock) {
      this.quantities[product.id] = current + 1;
    }
  }

  decreaseQuantity(product: any, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const current = this.getQuantity(product.id);
    if (current > 1) {
      this.quantities[product.id] = current - 1;
    }
  }

  addToCart(product: any, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (product.stock > 0) {
      const quantity = this.getQuantity(product.id);
      this.cartService.addToCart(product, quantity);
      alert('Produit ajouté au panier !');
    }
  }
}
