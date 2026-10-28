import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 dark:text-white transition-colors duration-200">
      
      <div *ngIf="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
      
      <div *ngIf="post && !loading">
        <a routerLink="/blog" class="inline-flex items-center text-sm font-medium text-brand hover:text-brand-dark mb-6">
          <svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour au blog
        </a>
        
        <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">{{ post.title }}</h1>
        <div class="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-8">
          <time [attr.datetime]="post.created_at">{{ post.created_at | date:'longDate' }}</time>
        </div>
        
        <img *ngIf="post.image" [src]="post.image" class="w-full rounded-xl shadow-lg mb-10 object-cover" style="max-height: 500px;" alt="">
        
        <div class="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
          <p class="whitespace-pre-line">{{ post.content }}</p>
        </div>
      </div>
      
      <div *ngIf="!post && !loading" class="text-center py-20 text-gray-500 dark:text-gray-400">
        Article introuvable.
      </div>
    </div>
  `
})
export class BlogPostComponent implements OnInit {
  post: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadPost(id);
      }
    });
  }

  loadPost(id: string) {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/blog/${id}/`).subscribe({
      next: (data) => {
        this.post = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur', err);
        this.loading = false;
      }
    });
  }
}
