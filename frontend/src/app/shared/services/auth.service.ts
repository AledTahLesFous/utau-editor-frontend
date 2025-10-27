import { Injectable } from '@angular/core';
import { Api } from './api.service.';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private api: Api) {}

  login(email: string, password: string) {
    return this.api.login(email, password);
  }

  registerUser(userData: { first_name: string; email: string; password: string }) {
    return this.api.registerUser(userData);
  }

  getMe(token: string) {
    return this.api.getMe(token);
  }

  updateMe(userData: any, token: string) {
  return this.api.updateMe(userData, token);
}

}
