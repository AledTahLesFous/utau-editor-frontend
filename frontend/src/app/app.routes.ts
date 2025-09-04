import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ProjectComponent } from './project/project.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'projet', component: ProjectComponent, canActivate: [AuthGuard] }, // Protégée
  { path: '**', redirectTo: 'login' }
];
