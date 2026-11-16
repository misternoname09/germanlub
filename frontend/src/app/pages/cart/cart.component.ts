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
        <div class="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
          <a [href]="getWhatsAppCartUrl()" target="_blank" rel="noopener noreferrer"
             class="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Commander sur WhatsApp
          </a>
          <button routerLink="/checkout" class="bg-brand hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm">
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

  getWhatsAppCartUrl(): string {
    const phone = '221787171818';
    const lines = this.items.map(
      item => `- ${item.quantity}x ${item.product.name} (${(item.product.price * item.quantity).toFixed(0)} F CFA)`
    );
    const message = `Bonjour GermanLub, je souhaite commander les produits suivants :\n${lines.join('\n')}\n\nTotal estimé : ${this.total.toFixed(0)} F CFA`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }
}
