import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private directusUrl = 'http://127.0.0.1:8055'; // Base URL Directus

  constructor(private http: HttpClient) {}

  // Login utilisateur
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.directusUrl}/auth/login`, { email, password });
  }

  // Créer un nouvel utilisateur
  registerUser(userData: { first_name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.directusUrl}/users/register`, userData);
  }


  // Récupérer les infos de l'utilisateur connecté
  getMe(token: string): Observable<any> {
    return this.http.get(`${this.directusUrl}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
