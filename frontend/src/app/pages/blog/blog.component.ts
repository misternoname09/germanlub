import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 dark:text-white transition-colors duration-200">
      <div class="text-center">
        <h2 class="text-3xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Conseils Auto & Actualités
        </h2>
        <p class="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
          Découvrez nos conseils pour entretenir votre véhicule et prolonger la durée de vie de votre moteur.
        </p>
      </div>

      <div *ngIf="loading" class="text-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        <p class="mt-2 text-gray-500 dark:text-gray-400">Chargement des articles...</p>
      </div>

      <div *ngIf="!loading && posts.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">
        Aucun article publié pour le moment. Revenez bientôt !
      </div>

      <div class="mt-12 max-w-lg mx-auto grid gap-5 lg:grid-cols-3 lg:max-w-none">
        <div *ngFor="let post of posts" class="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white dark:bg-gray-800 transition-colors duration-200">
          <div class="flex-shrink-0">
            <img *ngIf="post.image" class="h-48 w-full object-cover" [src]="post.image" alt="">
            <div *ngIf="!post.image" class="h-48 w-full bg-brand-dark flex items-center justify-center text-white text-3xl font-bold">
              Germanlub
            </div>
          </div>
          <div class="flex-1 p-6 flex flex-col justify-between">
            <div class="flex-1">
              <p class="text-sm font-medium text-brand">
                Article
              </p>
              <a [routerLink]="['/blog', post.id]" class="block mt-2">
                <p class="text-xl font-semibold text-gray-900 dark:text-white">
                  {{ post.title }}
                </p>
                <p class="mt-3 text-base text-gray-500 dark:text-gray-400 line-clamp-3">
                  {{ post.content }}
                </p>
              </a>
            </div>
            <div class="mt-6 flex items-center">
              <div class="flex space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <time [attr.datetime]="post.created_at">
                  {{ post.created_at | date:'longDate' }}
                </time>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BlogComponent implements OnInit {
  posts: any[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loading = true;
    this.http.get<any[]>(`${environment.apiUrl}/blog/`).subscribe({
      next: (data) => {
        this.posts = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur de chargement du blog', err);
        this.loading = false;
      }
    });
  }
}
