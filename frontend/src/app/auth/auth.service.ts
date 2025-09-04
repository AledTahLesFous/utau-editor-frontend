import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // URL exacte pour login admin Directus
  private authUrl = 'http://127.0.0.1:8055/auth/login';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.authUrl, { email, password });
  }


  getMe(token: string) {
  return this.http.get('http://127.0.0.1:8055/users/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
}

}
