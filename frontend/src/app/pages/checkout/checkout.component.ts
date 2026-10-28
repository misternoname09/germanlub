import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, TranslateDirective],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 class="text-3xl font-extrabold text-gray-900 mb-8">{{ 'CHECKOUT.TITLE' | translate }}</h2>
      
      <div *ngIf="items.length === 0 && !success" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
        <div class="flex">
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              <a routerLink="/catalog" class="font-medium underline hover:text-yellow-600">Retour au catalogue</a>
            </p>
          </div>
        </div>
      </div>

      <div *ngIf="success" class="bg-green-50 border-l-4 border-green-400 p-4 mb-8">
        <div class="flex">
          <div class="ml-3">
            <p class="mt-2 text-sm text-green-700">
              {{ 'CHECKOUT.SUCCESS' | translate }}
            </p>
            <div class="mt-4">
              <button (click)="goToCatalog()" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Continuer mes achats
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="items.length > 0 && !success" class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <form (ngSubmit)="submitOrder()" #checkoutForm="ngForm">
            <div class="grid grid-cols-6 gap-6">
              
              <div class="col-span-6 md:col-span-3">
                <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ 'CHECKOUT.NAME' | translate }}</label>
                <input type="text" name="name" id="name" required [(ngModel)]="customerName"
                  class="mt-1 focus:ring-brand focus:border-brand block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              </div>

              <div class="col-span-6 md:col-span-3">
                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ 'CHECKOUT.EMAIL' | translate }} (Optionnel)</label>
                <input type="email" name="email" id="email" [(ngModel)]="customerEmail"
                  class="mt-1 focus:ring-brand focus:border-brand block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              </div>

              <div class="col-span-6">
                <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ 'CHECKOUT.PHONE' | translate }}</label>
                <input type="tel" name="phone" id="phone" required [(ngModel)]="customerPhone"
                  class="mt-1 focus:ring-brand focus:border-brand block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              </div>

              <div class="col-span-6">
                <label for="address" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ 'CHECKOUT.ADDRESS' | translate }}</label>
                <textarea id="address" name="address" rows="3" required [(ngModel)]="customerAddress"
                  class="mt-1 focus:ring-brand focus:border-brand block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border bg-white dark:bg-gray-800 text-gray-900 dark:text-white"></textarea>
              </div>
              
              <div class="col-span-6 border-t border-gray-200 pt-4 mt-2">
                <label for="coupon" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{{ 'CHECKOUT.COUPON' | translate }}</label>
                <div class="mt-1 flex rounded-md shadow-sm">
                  <input type="text" name="coupon" id="coupon" [(ngModel)]="couponInput" [disabled]="couponApplied"
                    class="focus:ring-brand focus:border-brand flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 py-2 px-3 border bg-white dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="Ex: BIENVENUE10">
                  <button type="button" (click)="validateCoupon()" [disabled]="!couponInput || couponApplied || validatingCoupon"
                    class="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:bg-gray-200 disabled:text-gray-400">
                    <span *ngIf="validatingCoupon" class="animate-spin mr-2">↻</span>
                    {{ 'CHECKOUT.APPLY' | translate }}
                  </button>
                </div>
                <p *ngIf="couponError" class="mt-2 text-sm text-red-600">{{ couponError }}</p>
                <p *ngIf="couponApplied" class="mt-2 text-sm text-green-600 font-medium">
                  Code "{{ appliedCouponCode }}" appliqué avec succès ! Réduction : -{{ discountPercent }}%
                </p>
              </div>
            </div>

            <div class="mt-8 border-t border-gray-200 pt-5">
              <div class="flex justify-between items-center mb-2" *ngIf="couponApplied">
                <span class="text-md text-gray-500">{{ 'CHECKOUT.SUBTOTAL' | translate }} :</span>
                <span class="text-md text-gray-500 line-through">{{ subtotal | number:'1.0-0' }} F CFA</span>
              </div>
              <div class="flex justify-between items-center mb-4">
                <span class="text-lg font-medium text-gray-900">{{ 'CHECKOUT.ORDER_SUMMARY' | translate }} :</span>
                <span class="text-2xl font-bold text-brand">{{ finalTotal | number:'1.0-0' }} F CFA</span>
              </div>
              <div class="flex justify-end space-x-3">
                <button type="button" (click)="goToCart()" class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand">
                  Retour
                </button>
                <button type="button" (click)="submitOrder(true)" [disabled]="!checkoutForm.form.valid || loading"
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400">
                  <span *ngIf="!loading">Demander un Devis</span>
                  <span *ngIf="loading">...</span>
                </button>
                <button type="submit" [disabled]="!checkoutForm.form.valid || loading"
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:bg-gray-400">
                  <span *ngIf="!loading">{{ 'CHECKOUT.SUBMIT' | translate }}</span>
                  <span *ngIf="loading">...</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  items: CartItem[] = [];
  subtotal: number = 0;
  finalTotal: number = 0;
  
  customerName: string = '';
  customerEmail: string = '';
  customerPhone: string = '';
  customerAddress: string = '';
  
  // Coupon State
  couponInput: string = '';
  couponApplied: boolean = false;
  appliedCouponCode: string = '';
  discountPercent: number = 0;
  couponError: string = '';
  validatingCoupon: boolean = false;
  
  loading: boolean = false;
  success: boolean = false;

  constructor(
    private cartService: CartService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.cartService.items$.subscribe(items => {
      this.items = items;
      this.subtotal = this.cartService.getTotalPrice();
      this.calculateFinalTotal();
    });
  }

  calculateFinalTotal() {
    if (this.couponApplied && this.discountPercent > 0) {
      const discountAmount = (this.subtotal * this.discountPercent) / 100;
      this.finalTotal = this.subtotal - discountAmount;
    } else {
      this.finalTotal = this.subtotal;
    }
  }

  validateCoupon() {
    if (!this.couponInput) return;
    
    this.validatingCoupon = true;
    this.couponError = '';
    
    this.http.post<any>(`${environment.apiUrl}/coupons/validate/`, { code: this.couponInput }).subscribe({
      next: (res) => {
        this.validatingCoupon = false;
        this.couponApplied = true;
        this.appliedCouponCode = res.code;
        this.discountPercent = res.discount_percent;
        this.calculateFinalTotal();
      },
      error: (err) => {
        this.validatingCoupon = false;
        if (err.error && err.error.error) {
            this.couponError = err.error.error;
        } else {
            this.couponError = 'Code invalide ou expiré.';
        }
      }
    });
  }

  submitOrder(isQuote: boolean = false) {
    if (this.items.length === 0) return;
    
    this.loading = true;
    
    const orderData: any = {
      customer_name: this.customerName,
      customer_email: this.customerEmail,
      customer_phone: this.customerPhone,
      customer_address: this.customerAddress,
      is_quote: isQuote,
      items: this.items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }))
    };

    if (this.couponApplied && this.appliedCouponCode) {
      orderData.coupon_code = this.appliedCouponCode;
    }

    this.http.post(`${environment.apiUrl}/orders/`, orderData).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = true;
        this.cartService.clearCart();
      },
      error: (err) => {
        console.error('Erreur de commande', err);
        this.loading = false;
        alert('Une erreur est survenue lors de la commande. Veuillez réessayer.');
      }
    });
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  goToCatalog() {
    this.router.navigate(['/catalog']);
  }
}
