import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-manager-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-screen flex overflow-hidden bg-gray-100">
      
      <!-- Mobile sidebar (off-canvas) -->
      <div *ngIf="isMobileMenuOpen" class="fixed inset-0 flex z-40 md:hidden" role="dialog" aria-modal="true">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" aria-hidden="true" (click)="toggleMobileMenu()"></div>
        
        <div class="relative flex-1 flex flex-col max-w-xs w-full bg-white transition ease-in-out duration-300 transform">
          <!-- Close button -->
          <div class="absolute top-0 right-0 -mr-12 pt-2">
            <button type="button" class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" (click)="toggleMobileMenu()">
              <span class="sr-only">Close sidebar</span>
              <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div class="flex items-center flex-shrink-0 px-4">
              <img class="h-8 w-auto rounded-md" src="assets/logo.jpg" alt="Germanlub">
              <span class="ml-3 text-xl font-bold text-gray-900">Espace Gérant</span>
            </div>
            <nav class="mt-8 flex-1 px-2 space-y-2">
              <a routerLink="/manager/dashboard" routerLinkActive="bg-gray-100 text-gray-900" [routerLinkActiveOptions]="{exact: true}" (click)="toggleMobileMenu()" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md">Tableau de bord</a>
              <a routerLink="/manager/orders" routerLinkActive="bg-gray-100 text-gray-900" (click)="toggleMobileMenu()" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center justify-between px-2 py-2 text-base font-medium rounded-md">
                <span>Commandes</span>
                <span *ngIf="pendingCount > 0" class="bg-red-600 text-white py-0.5 px-2 rounded-full text-xs font-bold">{{ pendingCount }}</span>
              </a>
              <a routerLink="/manager/products" routerLinkActive="bg-gray-100 text-gray-900" (click)="toggleMobileMenu()" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md">Produits & Stocks</a>
              <a routerLink="/manager/categories" routerLinkActive="bg-gray-100 text-gray-900" (click)="toggleMobileMenu()" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md">Catégories</a>
              <a routerLink="/manager/coupons" routerLinkActive="bg-gray-100 text-gray-900" (click)="toggleMobileMenu()" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md">Codes Promo</a>
              <a routerLink="/manager/reviews" routerLinkActive="bg-gray-100 text-gray-900" (click)="toggleMobileMenu()" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md">Avis Clients</a>
            </nav>
          </div>
          <div class="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button (click)="logout()" class="flex-shrink-0 w-full group block text-left">
              <p class="text-base font-medium text-red-600 group-hover:text-red-700">Se déconnecter</p>
            </button>
          </div>
        </div>
        
        <div class="flex-shrink-0 w-14" aria-hidden="true"></div>
      </div>

      <!-- Static sidebar for desktop -->
      <div class="hidden md:flex md:flex-shrink-0">
        <div class="flex flex-col w-64">
          <!-- Sidebar component, swap this element with another sidebar if you like -->
          <div class="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div class="flex items-center flex-shrink-0 px-4">
                <img class="h-8 w-auto rounded-md" src="assets/logo.jpg" alt="Germanlub">
                <span class="ml-3 text-xl font-bold text-gray-900">Espace Gérant</span>
              </div>
              <nav class="mt-8 flex-1 px-2 space-y-2">
                
                <a routerLink="/manager/dashboard" routerLinkActive="bg-gray-100 text-gray-900" 
                  [routerLinkActiveOptions]="{exact: true}"
                  class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg class="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Tableau de bord
                </a>

                <a routerLink="/manager/orders" routerLinkActive="bg-gray-100 text-gray-900"
                  class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md">
                  <div class="flex items-center">
                    <svg class="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Commandes
                  </div>
                  <span *ngIf="pendingCount > 0" class="bg-red-600 text-white py-0.5 px-2 rounded-full text-xs font-bold">
                    {{ pendingCount }}
                  </span>
                </a>

                <a routerLink="/manager/products" routerLinkActive="bg-gray-100 text-gray-900"
                  class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg class="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Produits & Stocks
                </a>

                <a routerLink="/manager/categories" routerLinkActive="bg-gray-100 text-gray-900"
                  class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg class="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Catégories
                </a>

                <a routerLink="/manager/coupons" routerLinkActive="bg-gray-100 text-gray-900"
                  class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg class="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  Codes Promo
                </a>


                <a routerLink="/manager/reviews" routerLinkActive="bg-gray-100 text-gray-900"
                  class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                  <svg class="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Avis Clients
                </a>

              </nav>
            </div>
            <div class="flex-shrink-0 flex border-t border-gray-200 p-4">
              <button (click)="logout()" class="flex-shrink-0 w-full group block text-left">
                <div class="flex items-center">
                  <div class="ml-3">
                    <p class="text-sm font-medium text-red-600 group-hover:text-red-700 flex items-center">
                      <svg class="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Se déconnecter
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Main Content Area -->
      <div class="flex flex-col w-0 flex-1 overflow-hidden">
        <div class="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 flex justify-between bg-white border-b border-gray-200 shadow-sm">
            <div class="flex items-center px-4 py-3">
                <button type="button" class="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none" (click)="toggleMobileMenu()">
                  <span class="sr-only">Open sidebar</span>
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <span class="ml-2 text-lg font-bold text-gray-900">Espace Gérant</span>
            </div>
            <button (click)="logout()" class="px-4 py-2 text-sm text-red-600 font-medium flex items-center">
              <svg class="mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
        </div>
        
        <main class="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <router-outlet></router-outlet>
            </div>
          </div>
        </main>
      </div>

    </div>
  `
})
export class ManagerLayoutComponent implements OnInit, OnDestroy {
  pendingCount = 0;
  isMobileMenuOpen = false;
  private pollingInterval: any;

  constructor(private authService: AuthService, private orderService: OrderService) {}

  ngOnInit() {
    this.checkPendingOrders();
    this.pollingInterval = setInterval(() => {
      this.checkPendingOrders();
    }, 30000); // Poll every 30 seconds
  }

  ngOnDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  checkPendingOrders() {
    this.orderService.getPendingCount().subscribe({
      next: (res) => {
        this.pendingCount = res.count;
      },
      error: () => {}
    });
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout() {
    this.authService.logout();
  }
}
