import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ProjectCreateComponent } from './project/project-create.component';
import { ProjectViewComponent } from './project/project-view.component';
import { ProjectListComponent } from './project/project-list.component';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'project', component: ProjectCreateComponent, canActivate: [AuthGuard] },
  { path: 'projects', component: ProjectListComponent, canActivate: [AuthGuard] }, // liste des projets
  { path: 'project/:name', component: ProjectViewComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: 'login' }
];


