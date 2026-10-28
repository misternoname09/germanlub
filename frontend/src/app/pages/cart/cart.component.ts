import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService, CartItem } from '../../services/cart.service';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, TranslateDirective],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 mb-8">{{ 'CART.TITLE' | translate }}</h2>

      <div *ngIf="items.length === 0" class="text-center py-10 bg-white shadow rounded-lg">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63-.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">{{ 'CART.EMPTY' | translate }}</h3>
        <p class="mt-1 text-sm text-gray-500"></p>
        <div class="mt-6">
          <a routerLink="/catalog" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand">
            {{ 'CART.CONTINUE_SHOPPING' | translate }}
          </a>
        </div>
      </div>

      <div *ngIf="items.length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <ul role="list" class="divide-y divide-gray-200">
          <li *ngFor="let item of items" class="px-4 py-4 sm:px-6 flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-md overflow-hidden">
                <img *ngIf="item.product.image" [src]="item.product.image" alt="Produit" class="h-full w-full object-cover">
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">{{ item.product.name }}</div>
                <div class="text-sm text-gray-500">{{ item.product.price }} F CFA x {{ item.quantity }}</div>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-sm font-bold text-gray-900">{{ (item.product.price * item.quantity).toFixed(0) }} F CFA</span>
              <button (click)="removeItem(item.product.id)" class="text-red-500 hover:text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </li>
        </ul>
        <div class="bg-gray-50 px-4 py-5 sm:px-6 flex justify-between items-center">
          <span class="text-lg font-medium text-gray-900">{{ 'CART.TOTAL' | translate }}</span>
          <span class="text-2xl font-bold text-brand">{{ total.toFixed(0) }} F CFA</span>
        </div>
        <div class="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200 text-right">
          <button routerLink="/checkout" class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm">
            {{ 'CART.CHECKOUT' | translate }}
          </button>
        </div>
      </div>

      <!-- Recommendations Section -->
      <div *ngIf="items.length > 0 && recommendations.length > 0" class="mt-16">
        <h3 class="text-2xl font-extrabold text-gray-900 mb-6 flex items-center">
          <svg class="w-6 h-6 text-brand mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
          {{ 'CART.RECOMMENDATIONS_TITLE' | translate }}
        </h3>
        <div class="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3">
          <div *ngFor="let rec of recommendations" class="group relative bg-white border border-gray-200 rounded-lg flex flex-col overflow-hidden">
            <div class="aspect-w-3 aspect-h-4 bg-gray-200 group-hover:opacity-75 sm:aspect-none sm:h-48">
              <img *ngIf="rec.image" [src]="rec.image" alt="Recommendation" class="w-full h-full object-center object-cover sm:w-full sm:h-full">
            </div>
            <div class="flex-1 p-4 space-y-2 flex flex-col">
              <h3 class="text-sm font-medium text-gray-900">{{ rec.name }}</h3>
              <p class="text-sm text-gray-500 line-clamp-2">{{ rec.description }}</p>
              <div class="flex-1 flex items-end justify-between">
                <p class="text-base font-medium text-gray-900">{{ rec.price }} F CFA</p>
                <button (click)="addToCart(rec)" class="text-brand hover:text-brand-dark text-sm font-medium">{{ 'CART.RECOMMENDATIONS_ADD' | translate }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  total: number = 0;
  recommendations: any[] = [];

  constructor(private cartService: CartService, private http: HttpClient) {}

  ngOnInit() {
    this.cartService.items$.subscribe(items => {
      this.items = items;
      this.total = this.cartService.getTotalPrice();
      if (this.items.length > 0) {
        this.loadRecommendations();
      } else {
        this.recommendations = [];
      }
    });
  }

  loadRecommendations() {
    if (this.items.length === 0) return;
    const lastItem = this.items[this.items.length - 1];
    this.http.get<any[]>(`${environment.apiUrl}/products/${lastItem.product.id}/recommendations/`)
      .subscribe({
        next: (data) => {
          this.recommendations = data;
        },
        error: (err) => console.error('Error fetching recommendations', err)
      });
  }

  removeItem(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  addToCart(product: any) {
    this.cartService.addToCart(product);
  }
}
