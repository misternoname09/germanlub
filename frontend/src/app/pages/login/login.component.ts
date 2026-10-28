import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      
      <!-- Abstract Background Elements -->
      <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div class="absolute -top-24 -left-24 w-96 h-96 bg-brand rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div class="absolute top-1/4 -right-24 w-96 h-96 bg-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div class="absolute -bottom-24 left-1/3 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div class="max-w-md w-full space-y-8 relative z-10 bg-white/10 dark:bg-gray-800/40 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50">
        
        <!-- Header -->
        <div class="text-center">
          <img class="mx-auto h-20 w-auto rounded-xl shadow-lg border border-white/10" src="assets/logo.jpg" alt="GermanLub Logo">
          <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
            Espace Gérant
          </h2>
          <p class="mt-2 text-center text-sm text-gray-300">
            Connectez-vous pour accéder au tableau de bord
          </p>
        </div>

        <form class="mt-8 space-y-6" (ngSubmit)="onSubmit()" #loginForm="ngForm">
          
          <div *ngIf="errorMessage" class="bg-red-500/20 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              <p class="text-sm text-red-200 font-medium">{{ errorMessage }}</p>
            </div>
          </div>

          <div class="space-y-5">
            <div>
              <label for="username" class="block text-sm font-medium text-gray-300 mb-1">
                Nom d'utilisateur
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input id="username" name="username" type="text" required [(ngModel)]="username"
                  class="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-600/50 rounded-xl bg-gray-900/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent sm:text-sm transition-all shadow-inner">
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-300 mb-1">
                Mot de passe
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input id="password" name="password" type="password" required [(ngModel)]="password"
                  class="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-600/50 rounded-xl bg-gray-900/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent sm:text-sm transition-all shadow-inner">
              </div>
            </div>
          </div>

          <div>
            <button type="submit" [disabled]="!loginForm.form.valid || loading"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-brand disabled:bg-gray-600 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-brand/50">
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg *ngIf="!loading" class="h-5 w-5 text-brand-dark group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <svg *ngIf="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              <span *ngIf="!loading">Accéder au Dashboard</span>
              <span *ngIf="loading">Connexion...</span>
            </button>
          </div>
          
          <div class="mt-4 text-center">
            <a routerLink="/" class="text-xs text-gray-400 hover:text-white transition-colors flex items-center justify-center">
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Retour à la boutique
            </a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.errorMessage = '';
    
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Identifiants invalides.';
        console.error('Login error', err);
      }
    });
  }
}
