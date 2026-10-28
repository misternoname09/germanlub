import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-vehicle-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 max-w-4xl mx-auto -mt-16 relative z-10 border border-gray-100 dark:border-gray-700">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Trouvez l'huile exacte pour votre véhicule
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <!-- Marque -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Marque</label>
          <select [(ngModel)]="selectedMake" (ngModelChange)="onMakeChange()" class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-brand focus:border-brand block p-3">
            <option [ngValue]="null">Choisir une marque</option>
            <option *ngFor="let make of makes" [value]="make">{{ make }}</option>
          </select>
        </div>

        <!-- Modèle -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Modèle</label>
          <select [(ngModel)]="selectedModel" (ngModelChange)="onModelChange()" [disabled]="!selectedMake" class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-brand focus:border-brand block p-3 disabled:opacity-50">
            <option [ngValue]="null">Choisir un modèle</option>
            <option *ngFor="let model of models" [value]="model">{{ model }}</option>
          </select>
        </div>

        <!-- Motorisation -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Motorisation</label>
          <select [(ngModel)]="selectedEngine" (ngModelChange)="onEngineChange()" [disabled]="!selectedModel" class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-brand focus:border-brand block p-3 disabled:opacity-50">
            <option [ngValue]="null">Choisir le moteur</option>
            <option *ngFor="let engine of engines" [value]="engine">{{ engine }}</option>
          </select>
        </div>

        <!-- Bouton -->
        <div>
          <button (click)="searchOil()" [disabled]="!selectedVehicleId" class="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg transition-colors focus:ring-4 focus:outline-none focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed h-[46px] flex items-center justify-center">
            Trouver mon huile
          </button>
        </div>
      </div>
    </div>
  `
})
export class VehicleSelectorComponent implements OnInit {
  private apiUrl = environment.apiUrl;

  makes: string[] = [];
  models: string[] = [];
  engines: string[] = [];

  selectedMake: string | null = null;
  selectedModel: string | null = null;
  selectedEngine: string | null = null;
  
  selectedVehicleId: number | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadMakes();
  }

  loadMakes() {
    this.http.get<string[]>(`${this.apiUrl}/vehicles/makes/`).subscribe({
      next: (data) => {
        this.makes = data;
      },
      error: (err) => console.error('Error loading makes', err)
    });
  }

  onMakeChange() {
    this.selectedModel = null;
    this.selectedEngine = null;
    this.selectedVehicleId = null;
    this.models = [];
    this.engines = [];
    
    if (this.selectedMake) {
      this.http.get<string[]>(`${this.apiUrl}/vehicles/models/`, { params: { make: this.selectedMake } }).subscribe({
        next: (data) => {
          this.models = data;
        },
        error: (err) => console.error('Error loading models', err)
      });
    }
  }

  onModelChange() {
    this.selectedEngine = null;
    this.selectedVehicleId = null;
    this.engines = [];
    
    if (this.selectedMake && this.selectedModel) {
      this.http.get<string[]>(`${this.apiUrl}/vehicles/engines/`, { 
        params: { 
          make: this.selectedMake, 
          model: this.selectedModel 
        } 
      }).subscribe({
        next: (data) => {
          this.engines = data;
        },
        error: (err) => console.error('Error loading engines', err)
      });
    }
  }

  onEngineChange() {
    this.selectedVehicleId = null;
    if (this.selectedMake && this.selectedModel && this.selectedEngine) {
      this.http.get<any[]>(`${this.apiUrl}/vehicles/`, {
        params: {
          make: this.selectedMake,
          model_name: this.selectedModel,
          engine: this.selectedEngine
        }
      }).subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            this.selectedVehicleId = data[0].id;
          }
        },
        error: (err) => console.error('Error finding vehicle ID', err)
      });
    }
  }

  searchOil() {
    if (this.selectedVehicleId) {
      this.router.navigate(['/catalog'], { queryParams: { vehicles: this.selectedVehicleId } });
    }
  }
}
