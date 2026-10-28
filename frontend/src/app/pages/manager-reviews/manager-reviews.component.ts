import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-manager-reviews',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Avis Clients</h1>
      </div>

      <div *ngIf="loading" class="text-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>

      <div *ngIf="!loading && reviews.length === 0" class="text-center py-10 bg-white shadow rounded-lg">
        <p class="text-gray-500">Aucun avis trouvé.</p>
      </div>

      <div *ngIf="!loading && reviews.length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="overflow-x-auto w-full">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auteur</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commentaire</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let review of reviews">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ review.author_name }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center text-yellow-400">
                    <svg *ngFor="let star of [1,2,3,4,5]" class="h-4 w-4" [ngClass]="{'text-yellow-400': star <= review.rating, 'text-gray-300': star > review.rating}" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" [title]="review.comment">{{ review.comment }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ review.created_at | date:'dd/MM/yyyy' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button (click)="deleteReview(review.id)" class="text-red-600 hover:text-red-900">Supprimer</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ManagerReviewsComponent implements OnInit {
  reviews: any[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadReviews();
  }

  loadReviews() {
    this.loading = true;
    this.http.get<any[]>(`${environment.apiUrl}/reviews/`).subscribe({
      next: (data) => {
        this.reviews = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  deleteReview(id: number) {
    if(confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) {
      this.http.delete(`${environment.apiUrl}/reviews/${id}/`).subscribe({
        next: () => this.loadReviews(),
        error: () => alert('Erreur lors de la suppression')
      });
    }
  }
}
