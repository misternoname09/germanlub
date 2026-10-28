import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { OrderService, Order } from '../../services/order.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  template: `
    <div>
      <h1 class="text-2xl font-semibold text-gray-900">Vue d'ensemble</h1>
      
      <div *ngIf="loading" class="mt-6 text-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        <p class="mt-2 text-gray-500">Chargement des données...</p>
      </div>

      <div *ngIf="!loading">
        <!-- Stats Cards -->
        <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Total Orders -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Total Commandes</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ orders.length }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <!-- Pending Orders -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">En attente</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ pendingCount }}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <!-- Revenue -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <svg class="h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div class="ml-5 w-0 flex-1">
                  <dl>
                    <dt class="text-sm font-medium text-gray-500 truncate">Chiffre d'Affaires</dt>
                    <dd class="text-lg font-medium text-gray-900">{{ totalRevenue | number:'1.0-0' }} F CFA</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Area Chart (Sales/Forecast) -->
          <div class="lg:col-span-2 bg-white shadow rounded-lg p-6 relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-brand-dark"></div>
            <h3 class="text-lg font-bold text-gray-900 mb-1 flex items-center">
              <svg class="w-5 h-5 text-brand mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
              Prévisions de ventes (IA Prophet)
            </h3>
            <p class="text-sm text-gray-500 mb-4">Évolution estimée pour les 30 prochains jours</p>
            
            <div *ngIf="forecast.length > 0" id="chart" class="w-full">
              <apx-chart
                [series]="chartOptions.series"
                [chart]="chartOptions.chart"
                [xaxis]="chartOptions.xaxis"
                [yaxis]="chartOptions.yaxis"
                [stroke]="chartOptions.stroke"
                [fill]="chartOptions.fill"
                [tooltip]="chartOptions.tooltip"
                [dataLabels]="chartOptions.dataLabels"
                [colors]="chartOptions.colors"
              ></apx-chart>
            </div>
            <div *ngIf="forecast.length === 0" class="h-64 flex items-center justify-center text-gray-400">
              Pas de données de prévision disponibles
            </div>
          </div>

          <!-- Donut Chart (Order Status) -->
          <div class="bg-white shadow rounded-lg p-6 relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-green-400"></div>
            <h3 class="text-lg font-bold text-gray-900 mb-1 flex items-center">
              <svg class="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
              Répartition des Commandes
            </h3>
            <p class="text-sm text-gray-500 mb-4">Statuts actuels</p>
            
            <div id="donut-chart" class="w-full flex justify-center">
              <apx-chart
                [series]="donutOptions.series"
                [chart]="donutOptions.chart"
                [labels]="donutOptions.labels"
                [colors]="donutOptions.colors"
                [legend]="donutOptions.legend"
                [dataLabels]="donutOptions.dataLabels"
                [plotOptions]="donutOptions.plotOptions"
              ></apx-chart>
            </div>
          </div>

        </div>

        <!-- Low Stock Alerts -->
        <div class="mt-8 bg-white shadow rounded-lg">
          <div class="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
            <h3 class="text-lg leading-6 font-medium text-red-600 flex items-center">
              <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
              </svg>
              Alertes de Stock Critique (<= 5)
            </h3>
          </div>
          <ul class="divide-y divide-gray-200">
            <li *ngIf="lowStockProducts.length === 0" class="p-6 text-center text-gray-500">
              Tous les stocks sont à des niveaux sains.
            </li>
            <li *ngFor="let prod of lowStockProducts" class="px-4 py-4 sm:px-6 hover:bg-gray-50">
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
export class ManagerDashboardComponent implements OnInit {
  orders: Order[] = [];
  pendingCount: number = 0;
  totalRevenue: number = 0;
  
  forecast: any[] = [];
  lowStockProducts: any[] = [];
  loading = true;

  public chartOptions: any;
  public donutOptions: any;

  constructor(private orderService: OrderService, private http: HttpClient) {
    this.initCharts();
  }

  ngOnInit() {
    this.loadOrders();
    this.loadForecast();
    this.loadStats();
  }

  loadStats() {
    this.http.get<any>(`${environment.apiUrl}/dashboard-stats/`).subscribe({
      next: (data) => {
        this.lowStockProducts = data.low_stock_products || [];
      },
      error: (err) => console.error('Erreur chargement stats', err)
    });
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.pendingCount = this.orders.filter(o => o.status === 'PENDING').length;
        this.totalRevenue = this.orders.reduce((sum, o) => sum + parseFloat(o.total_amount as any), 0);
        
        // Update Donut Chart
        const validatedCount = this.orders.length - this.pendingCount;
        this.donutOptions.series = [this.pendingCount, validatedCount];

        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur de chargement', err);
        this.loading = false;
      }
    });
  }

  loadForecast() {
    this.orderService.getForecast().subscribe({
      next: (data) => {
        if (data && data.forecast) {
          this.forecast = data.forecast;
          const categories = this.forecast.map(f => new Date(f.ds).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
          const seriesData = this.forecast.map(f => Math.round(f.yhat));
          
          this.chartOptions.xaxis = {
            ...this.chartOptions.xaxis,
            categories: categories
          };
          this.chartOptions.series = [{
            name: 'Ventes Prévues',
            data: seriesData
          }];
        }
      },
      error: (err) => console.error('Error fetching forecast', err)
    });
  }

  initCharts() {
    // Area Chart Options (Prophet Forecast)
    this.chartOptions = {
      series: [{ name: "Ventes Prévues", data: [] }],
      chart: {
        height: 350,
        type: "area",
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: ['#ea580c'], // brand orange
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3 },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.1,
          stops: [0, 90, 100]
        }
      },
      xaxis: {
        type: "category",
        categories: [],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#9ca3af' } }
      },
      yaxis: {
        labels: { style: { colors: '#9ca3af' } }
      },
      tooltip: {
        theme: 'light',
        y: { formatter: function (val: number) { return val + " ventes" } }
      }
    };

    // Donut Chart Options (Order Status)
    this.donutOptions = {
      series: [0, 0],
      chart: { type: "donut", height: 320, fontFamily: 'Inter, sans-serif' },
      labels: ["En attente", "Validées"],
      colors: ['#facc15', '#4ade80'], // yellow, green
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              name: { show: true },
              value: { show: true, fontSize: '24px', fontWeight: 600, color: '#111827' },
              total: { show: true, showAlways: true, label: 'Total', fontSize: '16px', color: '#6b7280' }
            }
          }
        }
      },
      dataLabels: { enabled: false },
      legend: { position: 'bottom' }
    };
  }
}
