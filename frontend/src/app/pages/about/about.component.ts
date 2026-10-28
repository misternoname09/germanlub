import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg-white dark:bg-gray-900 min-h-screen transition-colors duration-300">
      
      <!-- Hero Section -->
      <div class="relative bg-brand text-white overflow-hidden">
        <div class="absolute inset-0 opacity-30 bg-[url('/assets/about_image.jpg')] bg-cover bg-center mix-blend-overlay"></div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 drop-shadow-md">À propos de GermanLub</h1>
          <p class="mt-4 max-w-3xl text-xl md:text-2xl mx-auto text-orange-50 drop-shadow">
            L'excellence de l'ingénierie allemande au service de la performance et de la longévité de votre moteur.
          </p>
        </div>
      </div>

      <!-- Content Section -->
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
              <source src="assets/video_germanlub.mp4" type="video/mp4">
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
export class AboutComponent {}
