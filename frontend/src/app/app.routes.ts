import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { HomeComponent } from './home/home.component';
import { ProjectCreateComponent } from './project/project-create.component';
import { ProjectViewComponent } from './project/project-view.component';
import { ProjectListComponent } from './project/project-list.component';
import { ProjectEditComponent } from './project/project-edit.component';

import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: 'home', component: HomeComponent},
  { path: 'project', component: ProjectCreateComponent, canActivate: [AuthGuard] },
  { path: 'projects', component: ProjectListComponent, canActivate: [AuthGuard] }, // liste des projets
  { path: 'project/:name', component: ProjectEditComponent, canActivate: [AuthGuard] },
  { path: 'project-view/:name', component: ProjectViewComponent }, // public
  { path: '', component: HomeComponent},
  { path: '**', redirectTo: '' }
];


