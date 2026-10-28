import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 dark:text-white">
      <div class="md:flex md:items-center md:justify-between mb-8">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Tableau de Bord Gérant
          </h2>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4">
          <a href="http://localhost:8000/admin/" target="_blank"
             class="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand">
            Accès Admin Django Complet
          </a>
        </div>
      </div>

      <div *ngIf="loading" class="text-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>

      <div *ngIf="!loading && stats" class="space-y-8">
        <!-- KPIs -->
        <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div class="px-4 py-5 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden sm:p-6">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Chiffre d'Affaires
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-brand">
              {{ stats.total_revenue | number:'1.0-0' }} F CFA
            </dd>
          </div>

          <div class="px-4 py-5 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden sm:p-6">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Total Commandes
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {{ stats.total_orders }}
            </dd>
          </div>

          <div class="px-4 py-5 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden sm:p-6 relative">
            <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Commandes en attente
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-yellow-500">
              {{ stats.pending_orders }}
            </dd>
            <span *ngIf="stats.pending_orders > 0" class="absolute top-4 right-4 flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
          </div>
        </dl>

        <!-- Low Stock Alerts -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div class="px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6 flex justify-between items-center">
            <h3 class="text-lg leading-6 font-medium text-red-600 dark:text-red-400 flex items-center">
              <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              Alertes de Stock Critique (<= 5)
            </h3>
          </div>
          <ul class="divide-y divide-gray-200 dark:divide-gray-700">
            <li *ngIf="stats.low_stock_products.length === 0" class="p-6 text-center text-gray-500 dark:text-gray-400">
              Tous les stocks sont à des niveaux sains.
            </li>
            <li *ngFor="let prod of stats.low_stock_products" class="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-750">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-brand truncate">
                  {{ prod.name }}
                </p>
                <div class="ml-2 flex-shrink-0 flex">
                  <p class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Il reste : {{ prod.stock }}
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  stats: any = null;
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    // Requires Auth Interceptor to attach the JWT token
    this.http.get<any>(`${environment.apiUrl}/dashboard-stats/`).subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load stats', err);
        this.loading = false;
      }
    });
  }
}
