import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'germanlub_token';
  private refreshKey = 'germanlub_refresh';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/token/`, { username, password })
      .pipe(
        tap(response => {
          if (response.access) {
            localStorage.setItem(this.tokenKey, response.access);
          }
          if (response.refresh) {
            localStorage.setItem(this.refreshKey, response.refresh);
          }
        })
      );
  }

  refreshToken() {
    const refresh = localStorage.getItem(this.refreshKey);
    if (!refresh) return null;
    return this.http.post<any>(`${environment.apiUrl}/token/refresh/`, { refresh })
      .pipe(
        tap(response => {
          if (response.access) {
            localStorage.setItem(this.tokenKey, response.access);
          }
        })
      );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
