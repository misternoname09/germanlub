import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-gray-50 dark:bg-gray-900 min-h-screen py-16 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="text-center mb-16">
          <h2 class="text-base text-brand font-semibold tracking-wide uppercase">Parlons de vos besoins</h2>
          <p class="mt-2 text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
            Contactez-nous
          </p>
          <p class="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
            Notre équipe est à votre disposition pour répondre à toutes vos questions et vous proposer les meilleures solutions.
          </p>
        </div>

        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-200">
          <div class="grid grid-cols-1 lg:grid-cols-3">
            
            <!-- Contact Info Sidebar -->
            <div class="bg-gray-900 py-10 px-6 sm:px-10 lg:col-span-1 xl:p-12">
              <h3 class="text-2xl font-bold text-white mb-8">Restons en contact</h3>
              <p class="text-gray-300 text-lg mb-8">
                Que ce soit pour une demande de devis, une inscription à nos formations ou pour toute autre question, n'hésitez pas à nous contacter ou à nous rendre visite.
              </p>
              
              <dl class="mt-8 space-y-6">
                <dt><span class="sr-only">Phone number</span></dt>
                <dd class="flex text-base text-gray-300">
                  <svg class="flex-shrink-0 w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span class="ml-3">+221 78 717 18 18</span>
                </dd>

                <dt><span class="sr-only">Address</span></dt>
                <dd class="flex text-base text-gray-300">
                  <svg class="flex-shrink-0 w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span class="ml-3">Dakar, Sénégal</span>
                </dd>
              </dl>
              
              <div class="mt-12">
                <h4 class="text-xl font-bold text-white mb-2">GermanLub</h4>
                <p class="text-gray-400 text-sm">
                  L'excellence allemande pour votre moteur. La meilleure huile pour des performances optimales et une durée de vie prolongée de votre moteur. Qualité certifiée.
                </p>
              </div>
            </div>

            <!-- Contact Form -->
            <div class="py-10 px-6 sm:px-10 lg:col-span-2 xl:p-12">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-8">Envoyez-nous un message</h3>
              <form (ngSubmit)="onSubmit()" class="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                
                <div class="sm:col-span-1">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom complet *</label>
                  <div class="mt-1">
                    <input type="text" [(ngModel)]="formData.name" name="name" required placeholder="Votre nom"
                      class="py-3 px-4 block w-full shadow-sm focus:ring-brand focus:border-brand border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-colors">
                  </div>
                </div>

                <div class="sm:col-span-1">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Entreprise</label>
                  <div class="mt-1">
                    <input type="text" [(ngModel)]="formData.company" name="company" placeholder="Votre entreprise"
                      class="py-3 px-4 block w-full shadow-sm focus:ring-brand focus:border-brand border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-colors">
                  </div>
                </div>

                <div class="sm:col-span-1">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
                  <div class="mt-1">
                    <input type="email" [(ngModel)]="formData.email" name="email" required placeholder="votre@email.com"
                      class="py-3 px-4 block w-full shadow-sm focus:ring-brand focus:border-brand border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-colors">
                  </div>
                </div>

                <div class="sm:col-span-1">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                  <div class="mt-1">
                    <input type="text" [(ngModel)]="formData.phone" name="phone" placeholder="+221 XX XXX XX XX"
                      class="py-3 px-4 block w-full shadow-sm focus:ring-brand focus:border-brand border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-colors">
                  </div>
                </div>

                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Sujet</label>
                  <div class="mt-1">
                    <select [(ngModel)]="formData.subject" name="subject" class="py-3 px-4 block w-full shadow-sm focus:ring-brand focus:border-brand border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-colors">
                      <option value="">— Sélectionnez —</option>
                      <option value="Devis">Demande de devis</option>
                      <option value="Formation">Inscription à nos formations</option>
                      <option value="Question">Autre question</option>
                    </select>
                  </div>
                </div>

                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Message *</label>
                  <div class="mt-1">
                    <textarea rows="4" [(ngModel)]="formData.message" name="message" required placeholder="Décrivez votre besoin..."
                      class="py-3 px-4 block w-full shadow-sm focus:ring-brand focus:border-brand border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-colors"></textarea>
                  </div>
                </div>

                <div class="sm:col-span-2">
                  <button type="submit" [disabled]="loading" class="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-colors duration-300 disabled:opacity-50">
                    <span *ngIf="!loading">Envoyer le message</span>
                    <span *ngIf="loading">Envoi en cours...</span>
                  </button>
                </div>
                
              </form>
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  `
})
export class ContactComponent {
  formData = {
    name: '',
    company: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  loading = false;

  constructor(private http: HttpClient) {}

  onSubmit() {
    if (!this.formData.name || !this.formData.email || !this.formData.message) {
      alert("Veuillez remplir tous les champs obligatoires (*).");
      return;
    }
    
    this.loading = true;
    
    this.http.post(`${environment.apiUrl}/contact/`, this.formData).subscribe({
      next: () => {
        alert("Votre message a bien été envoyé ! Notre équipe vous contactera sous peu.");
        this.formData = { name: '', company: '', email: '', phone: '', subject: '', message: '' };
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        alert("Une erreur est survenue lors de l'envoi du message.");
        this.loading = false;
      }
    });
  }
}
