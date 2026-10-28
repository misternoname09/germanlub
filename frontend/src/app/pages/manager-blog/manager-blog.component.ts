import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-manager-blog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Blog</h1>
        <button (click)="openCreateModal()" class="bg-brand text-white px-4 py-2 rounded shadow hover:bg-brand-dark transition">
          + Nouvel Article
        </button>
      </div>

      <div *ngIf="loading" class="text-center py-10">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>

      <div *ngIf="!loading && posts.length === 0" class="text-center py-10 bg-white shadow rounded-lg">
        <p class="text-gray-500">Aucun article de blog trouvé.</p>
      </div>

      <div *ngIf="!loading && posts.length > 0" class="bg-white shadow overflow-hidden sm:rounded-lg">
        <div class="overflow-x-auto w-full">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let post of posts">
                <td class="px-6 py-4 whitespace-nowrap flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md overflow-hidden">
                    <img *ngIf="post.image" [src]="post.image" alt="" class="h-10 w-10 object-cover">
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ post.title }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ post.created_at | date:'dd/MM/yyyy' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button (click)="deletePost(post.id)" class="text-red-600 hover:text-red-900">Supprimer</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Modal Create -->
      <div *ngIf="showModal" class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="closeModal()"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                Rédiger un Article
              </h3>
              <div class="grid grid-cols-1 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Titre</label>
                  <input type="text" [(ngModel)]="newPost.title" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border text-gray-900 bg-white">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Contenu</label>
                  <textarea [(ngModel)]="newPost.content" rows="10" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand focus:border-brand sm:text-sm p-2 border text-gray-900 bg-white"></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Image de couverture</label>
                  <input type="file" (change)="onFileSelected($event)" accept="image/*" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand file:text-white hover:file:bg-brand-dark">
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="button" (click)="savePost()" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand text-base font-medium text-white hover:bg-brand-dark sm:ml-3 sm:w-auto sm:text-sm transition-colors">
                Publier
              </button>
              <button type="button" (click)="closeModal()" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class ManagerBlogComponent implements OnInit {
  posts: any[] = [];
  loading = true;
  showModal = false;
  newPost = { title: '', content: '' };
  selectedFile: File | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.loading = true;
    this.http.get<any[]>(`${environment.apiUrl}/blog/`).subscribe({
      next: (data) => {
        this.posts = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  openCreateModal() {
    this.newPost = { title: '', content: '' };
    this.selectedFile = null;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  savePost() {
    if (!this.newPost.title || !this.newPost.content) return;
    
    const formData = new FormData();
    formData.append('title', this.newPost.title);
    formData.append('content', this.newPost.content);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    this.http.post(`${environment.apiUrl}/blog/`, formData).subscribe({
      next: () => {
        this.closeModal();
        this.loadPosts();
      },
      error: (err) => alert('Erreur lors de la création')
    });
  }

  deletePost(id: number) {
    if(confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      this.http.delete(`${environment.apiUrl}/blog/${id}/`).subscribe({
        next: () => this.loadPosts(),
        error: () => alert('Erreur lors de la suppression')
      });
    }
  }
}
