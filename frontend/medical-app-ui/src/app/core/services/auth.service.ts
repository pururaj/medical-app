import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  expiresIn: number;
}

export interface LoginApiResponse {
  success: boolean;
  message: string;
  data: LoginResponse;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly AUTH_URL = 'http://localhost:8086/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<LoginApiResponse> {
    return this.http.post<LoginApiResponse>(`${this.AUTH_URL}/login`, { username, password }).pipe(
      tap(res => {
        if (res.data) {
          localStorage.setItem('auth_token', res.data.token);
          localStorage.setItem('user_role', res.data.role);
          localStorage.setItem('username', res.data.username);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getRole(): string {
    return localStorage.getItem('user_role') ?? '';
  }

  getUsername(): string {
    return localStorage.getItem('username') ?? '';
  }

  hasRole(roles: string[]): boolean {
    return roles.includes(this.getRole());
  }
}
