import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { VehicleSelectorComponent } from '../../components/vehicle-selector/vehicle-selector.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, TranslateDirective, VehicleSelectorComponent],
  template: `
    <div class="bg-white dark:bg-gray-900 transition-colors duration-200">
      
      <!-- HERO SECTION -->
      <div class="relative bg-gray-900 overflow-hidden">
        <div class="absolute inset-0">
          <img src="/assets/home_hero_bg.jpg" alt="Germanlub Performance" class="w-full h-full object-cover opacity-75">
          <div class="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/50 to-transparent"></div>
        </div>
        
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col justify-center min-h-[80vh]">
          <h1 class="text-3xl tracking-tight font-extrabold text-white sm:text-4xl md:text-5xl lg:w-3/4">
            <span class="block">{{ 'HOME.HERO.TITLE1' | translate }}</span>
            <span class="block text-brand mt-2">{{ 'HOME.HERO.TITLE2' | translate }}</span>
          </h1>
          <p class="mt-6 text-xl text-gray-300 max-w-2xl">
            {{ 'HOME.HERO.SUBTITLE' | translate }}
          </p>
          <div class="mt-10 flex flex-col sm:flex-row gap-4">
            <a routerLink="/catalog" class="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-brand hover:bg-brand-dark transition-colors duration-300 shadow-lg hover:shadow-brand/50">
              {{ 'HOME.HERO.BTN_DISCOVER' | translate }}
            </a>
          </div>
        </div>
      </div>

      <!-- VEHICLE SELECTOR SECTION (Temporarily Hidden) -->
      <!--
      <div class="px-4 sm:px-6 lg:px-8">
        <app-vehicle-selector></app-vehicle-selector>
      </div>
      -->

      <!-- FEATURED PRODUCTS SECTION -->
      <div class="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">{{ 'HOME.PRODUCTS.TITLE' | translate }}</h2>
          <p class="mt-4 text-xl text-gray-500 dark:text-gray-400">{{ 'HOME.PRODUCTS.SUBTITLE' | translate }}</p>
        </div>

        <div *ngIf="loadingProducts" class="text-center py-10">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>

        <div class="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 gap-x-8">
          <a *ngFor="let product of featuredProducts" [routerLink]="['/product', product.id]" class="group cursor-pointer">
            <div class="w-full aspect-w-1 aspect-h-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden relative flex items-center justify-center p-4">
              <img *ngIf="product.image" [src]="product.image" alt="Produit" class="w-full h-64 object-center object-contain group-hover:scale-105 transition-transform duration-300">
              <div *ngIf="product.stock === 0" class="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">{{ 'HOME.PRODUCTS.OUT_OF_STOCK' | translate }}</div>
            </div>
            <h3 class="mt-4 text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{{ product.name }}</h3>
            <p class="mt-1 text-lg font-bold text-brand">{{ product.price }} F CFA</p>
            
            <div *ngIf="product.stock > 0" class="mt-3 flex items-center justify-between border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-800" (click)="$event.preventDefault(); $event.stopPropagation()">
              <button type="button" (click)="decreaseQuantity(product, $event)" class="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors border-r border-gray-300 dark:border-gray-600">-</button>
              <span class="px-3 py-1 text-sm font-medium text-gray-900 dark:text-white">{{ getQuantity(product.id) }}</span>
              <button type="button" (click)="increaseQuantity(product, $event)" class="px-3 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors border-l border-gray-300 dark:border-gray-600">+</button>
            </div>

            <button (click)="addToCart(product, $event)" 
              [disabled]="product.stock === 0"
              [ngClass]="product.stock === 0 ? 'bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed' : 'bg-white dark:bg-gray-800 border-brand text-brand hover:bg-brand hover:text-white'"
              class="mt-3 w-full border transition-colors py-2 rounded-md text-sm font-medium">
              {{ product.stock === 0 ? 'Rupture de Stock' : ('HOME.PRODUCTS.ADD_TO_CART' | translate) }}
            </button>
          </a>
        </div>
        <div class="mt-10 text-center">
          <a routerLink="/catalog" class="inline-flex items-center text-brand font-medium hover:text-brand-dark">
            {{ 'HOME.PRODUCTS.VIEW_ALL' | translate }}
            <svg class="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>

      <!-- FEATURES SECTION -->
      <div class="pt-8 pb-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div class="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div class="w-16 h-16 mx-auto bg-brand/10 text-brand rounded-full flex items-center justify-center mb-4">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ 'HOME.FEATURES.F1_TITLE' | translate }}</h3>
              <p class="text-gray-500 dark:text-gray-300">{{ 'HOME.FEATURES.F1_DESC' | translate }}</p>
            </div>
            
            <div class="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div class="w-16 h-16 mx-auto bg-brand/10 text-brand rounded-full flex items-center justify-center mb-4">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ 'HOME.FEATURES.F2_TITLE' | translate }}</h3>
              <p class="text-gray-500 dark:text-gray-300">{{ 'HOME.FEATURES.F2_DESC' | translate }}</p>
            </div>

            <div class="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div class="w-16 h-16 mx-auto bg-brand/10 text-brand rounded-full flex items-center justify-center mb-4">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ 'HOME.FEATURES.F3_TITLE' | translate }}</h3>
              <p class="text-gray-500 dark:text-gray-300">{{ 'HOME.FEATURES.F3_DESC' | translate }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- A Propos Section (Moved from About Page) -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div class="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">Notre Histoire & Notre Mission</h2>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Fondée sur les principes de la rigueur et de l'innovation, GermanLub est née d'une vision simple : apporter aux conducteurs du monde entier la qualité absolue des lubrifiants allemands. 
            </p>
            <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Que vous conduisiez un véhicule de tourisme, un poids lourd ou un utilitaire, notre mission est de garantir que chaque goutte de notre huile maximise les performances, réduit l'usure et abaisse votre consommation de carburant.
            </p>
            <ul class="space-y-4 text-gray-700 dark:text-gray-300 font-medium">
              <li class="flex items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <svg class="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Qualité certifiée selon les normes européennes
              </li>
              <li class="flex items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Protection anti-usure avancée
              </li>
              <li class="flex items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center mr-4">
                  <svg class="h-5 w-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Engagement écologique et durable
              </li>
            </ul>
          </div>
          <div class="mt-12 lg:mt-0 relative rounded-2xl overflow-hidden shadow-2xl group">
            <video class="w-full object-cover" autoplay loop muted playsinline controls>
              <source src="/assets/video_germanlub.mp4" type="video/mp4">
            </video>
            <div class="absolute inset-0 bg-gradient-to-tr from-brand/40 to-transparent mix-blend-multiply pointer-events-none"></div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 class="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">Prêt à donner le meilleur à votre moteur ?</h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Découvrez notre gamme complète d'huiles moteurs et trouvez celle qui est parfaitement adaptée à votre véhicule.
          </p>
          <a routerLink="/catalog" class="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-bold rounded-lg text-white bg-brand hover:bg-brand-dark transition-all duration-300 shadow-xl hover:shadow-brand/50 transform hover:-translate-y-1">
            Explorer le Catalogue
            <svg class="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </a>
        </div>
      </div>

    </div>
  `
})
export class HomeComponent implements OnInit {
  featuredProducts: any[] = [];
  loadingProducts = true;
  quantities: { [key: number]: number } = {};

  constructor(
    private http: HttpClient,
    private cartService: CartService
  ) { }

  ngOnInit() {
    // Fetch 4 featured products
    this.http.get<any[]>(`${environment.apiUrl}/products/`).subscribe({
      next: (data) => {
        this.featuredProducts = data.slice(0, 4);
        this.loadingProducts = false;
      },
      error: () => this.loadingProducts = false
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
