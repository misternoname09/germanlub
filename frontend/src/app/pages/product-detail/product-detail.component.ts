import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 dark:text-white">
      <div *ngIf="loading" class="text-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
      
      <div *ngIf="product" class="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
        <!-- Image gallery -->
        <div class="flex flex-col-reverse">
          <div class="w-full aspect-w-1 aspect-h-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex items-center justify-center p-8">
            <img *ngIf="product.image" [src]="product.image" alt="Product image" class="w-full h-full object-center object-contain">
            <div *ngIf="!product.image" class="w-full h-96 flex items-center justify-center text-gray-500 dark:text-gray-400">Sans image</div>
          </div>
        </div>

        <!-- Product info -->
        <div class="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
          <h1 class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{{ product.name }}</h1>
          <div class="mt-3">
            <h2 class="sr-only">Product information</h2>
            <p class="text-3xl text-gray-900 dark:text-gray-300">{{ product.price }} F CFA</p>
          </div>

          <!-- Reviews summary -->
          <div class="mt-3">
            <div class="flex items-center">
              <div class="flex items-center text-yellow-400">
                <svg *ngFor="let star of [1,2,3,4,5]" [ngClass]="{'text-yellow-400': averageRating >= star, 'text-gray-300 dark:text-gray-600': averageRating < star}" class="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <a href="javascript:void(0)" (click)="scrollToReviews()" class="ml-3 text-sm text-brand hover:text-brand-dark hover:underline cursor-pointer">{{ product.reviews?.length || 0 }} avis</a>
            </div>
          </div>

          <div class="mt-6">
            <h3 class="sr-only">Description</h3>
            <div class="text-base text-gray-700 dark:text-gray-300 space-y-6" [innerHTML]="product.description"></div>
          </div>
          
          <div class="mt-4" *ngIf="product.technical_sheet">
            <a [href]="product.technical_sheet" target="_blank" rel="noopener noreferrer" 
               class="inline-flex items-center text-brand hover:text-brand-dark font-medium transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              Télécharger la fiche technique (PDF)
            </a>
          </div>

          <form class="mt-6">
            <div class="mt-10 flex flex-col gap-4">
              
              <!-- Sélecteur de quantité -->
              <div class="flex items-center space-x-3" *ngIf="product.stock > 0">
                <label for="quantity" class="text-sm font-medium text-gray-700 dark:text-gray-300">Quantité :</label>
                <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-800">
                  <button type="button" (click)="decreaseQuantity()" class="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors border-r border-gray-300 dark:border-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                  </button>
                  <input type="number" id="quantity" [(ngModel)]="selectedQuantity" name="quantity" min="1" [max]="product.stock" class="w-16 text-center border-0 focus:ring-0 py-2 dark:bg-gray-800 dark:text-white" readonly>
                  <button type="button" (click)="increaseQuantity()" class="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors border-l border-gray-300 dark:border-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                  </button>
                </div>
                <span class="text-sm text-gray-500 dark:text-gray-400">({{ product.stock }} en stock)</span>
              </div>

              <!-- Boutons -->
              <div class="flex flex-col sm:flex-row gap-4 w-full mt-2">
                <button (click)="addToCart(product)" type="button" 
                  [disabled]="product.stock === 0"
                  [ngClass]="product.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand hover:bg-brand-dark focus:ring-2 focus:ring-offset-2 focus:ring-brand'"
                  class="flex-1 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white focus:outline-none focus:ring-offset-gray-50 transition-colors">
                  {{ product.stock === 0 ? 'Rupture de Stock' : 'Ajouter au panier' }}
                </button>
                
                <a [href]="getWhatsAppProductUrl()" target="_blank" rel="noopener noreferrer"
                   class="flex-1 bg-green-500 hover:bg-green-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Commander sur WhatsApp
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Cross Selling / Suggested Products -->
      <div class="mt-16 lg:mt-24 border-t border-gray-200 dark:border-gray-700 pt-10" *ngIf="suggestedProducts && suggestedProducts.length > 0">
        <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">Produits souvent achetés ensemble</h2>
        <div class="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8 gap-x-6">
          <a *ngFor="let prod of suggestedProducts" [routerLink]="['/product', prod.id]" class="group cursor-pointer">
            <div class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden relative flex items-center justify-center p-4 h-48">
              <img *ngIf="prod.image" [src]="prod.image" alt="Produit" class="w-full h-full object-center object-contain group-hover:scale-105 transition-transform duration-300">
              <div *ngIf="!prod.image" class="text-gray-400 text-sm">Sans image</div>
            </div>
            <h3 class="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">{{ prod.name }}</h3>
            <p class="mt-1 text-lg font-bold text-gray-900 dark:text-white">{{ prod.price }} F CFA</p>
          </a>
        </div>
      </div>

      <!-- Reviews Section -->
      <div id="reviews" class="mt-16 lg:mt-24" *ngIf="product">
        <h2 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">Avis des clients</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div *ngIf="!product.reviews || product.reviews.length === 0" class="text-gray-500 dark:text-gray-400">
              Aucun avis pour le moment. Soyez le premier !
            </div>
            <div class="space-y-8">
              <div *ngFor="let review of product.reviews" class="border-b border-gray-200 dark:border-gray-700 pb-8">
                <div class="flex items-center mb-2">
                  <div class="font-bold text-gray-900 dark:text-white mr-4">{{ review.author_name }}</div>
                  <div class="flex items-center text-yellow-400">
                    <svg *ngFor="let star of [1,2,3,4,5]" [ngClass]="{'text-yellow-400': review.rating >= star, 'text-gray-300 dark:text-gray-600': review.rating < star}" class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                <p class="text-gray-600 dark:text-gray-300">{{ review.comment }}</p>
                <div class="text-xs text-gray-400 mt-2">{{ review.created_at | date:'longDate' }}</div>
              </div>
            </div>
          </div>
          
          <!-- Submit Review Form -->
          <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Laissez votre avis</h3>
            <form (ngSubmit)="submitReview()">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Votre Nom</label>
                <input type="text" [(ngModel)]="newReview.author_name" name="author_name" required class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand dark:bg-gray-700 dark:text-white transition-colors duration-200">
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Note (sur 5)</label>
                <select [(ngModel)]="newReview.rating" name="rating" class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand dark:bg-gray-700 dark:text-white transition-colors duration-200">
                  <option [ngValue]="5">5 - Excellent</option>
                  <option [ngValue]="4">4 - Très bien</option>
                  <option [ngValue]="3">3 - Bien</option>
                  <option [ngValue]="2">2 - Moyen</option>
                  <option [ngValue]="1">1 - Mauvais</option>
                </select>
              </div>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Commentaire</label>
                <textarea [(ngModel)]="newReview.comment" name="comment" rows="4" required class="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand focus:border-brand dark:bg-gray-700 dark:text-white transition-colors duration-200"></textarea>
              </div>
              <button type="submit" [disabled]="submittingReview" class="w-full bg-brand border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-50 transition-colors">
                {{ submittingReview ? 'Envoi...' : 'Envoyer l\\'avis' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  product: any = null;
  suggestedProducts: any[] = [];
  loading = true;
  averageRating = 0;
  selectedQuantity = 1;
  
  newReview = {
    author_name: '',
    rating: 5,
    comment: ''
  };
  submittingReview = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cartService: CartService,
    private meta: Meta,
    private title: Title
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: string) {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/products/${id}/`).subscribe({
      next: (data) => {
        this.product = data;
        
        // SEO Optimisation
        this.title.setTitle(`${this.product.name} - GermanLub`);
        this.meta.updateTag({ name: 'description', content: `Découvrez l'huile ${this.product.name} au prix de ${this.product.price} FCFA chez GermanLub. Qualité allemande garantie.` });
        if (this.product.image) {
          this.meta.updateTag({ property: 'og:image', content: this.product.image });
        }
        
        this.calculateAverageRating();
        this.loadSuggestedProducts(this.product.id);
      
        // Reset quantity
        this.selectedQuantity = 1;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur', err);
        this.loading = false;
      }
    });
  }

  loadSuggestedProducts(id: string) {
    this.http.get<any[]>(`${environment.apiUrl}/products/${id}/recommendations/`).subscribe({
      next: (data) => {
        this.suggestedProducts = data;
      },
      error: (err) => console.error('Erreur chargement recommandations', err)
    });
  }

  calculateAverageRating() {
    if (this.product && this.product.reviews && this.product.reviews.length > 0) {
      const sum = this.product.reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
      this.averageRating = Math.round(sum / this.product.reviews.length);
    } else {
      this.averageRating = 0;
    }
  }

  increaseQuantity() {
    if (this.product && this.selectedQuantity < this.product.stock) {
      this.selectedQuantity++;
    }
  }

  decreaseQuantity() {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
    }
  }

  addToCart(product: any) {
    if (product.stock > 0) {
      this.cartService.addToCart(product, this.selectedQuantity);
      alert('Produit ajouté au panier !');
    }
  }

  getWhatsAppProductUrl(): string {
    if (!this.product) return '';
    const phone = '221787171818';
    const message = `Bonjour, je suis intéressé par le produit *${this.product.name}* affiché à ${this.product.price} F CFA sur votre site. Est-il disponible ?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  submitReview() {
    if (!this.newReview.author_name || !this.newReview.comment) return;
    
    this.submittingReview = true;
    const reviewData = {
      ...this.newReview,
      product: this.product.id
    };

    this.http.post(`${environment.apiUrl}/reviews/`, reviewData).subscribe({
      next: (res) => {
        // Add to local list to show immediately
        this.product.reviews.unshift(res);
        this.calculateAverageRating();
        this.newReview = { author_name: '', rating: 5, comment: '' };
        this.submittingReview = false;
      },
      error: (err) => {
        console.error('Erreur ajout avis', err);
        this.submittingReview = false;
      }
    });
  }

  scrollToReviews() {
    const element = document.getElementById('reviews');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
