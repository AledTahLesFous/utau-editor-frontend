import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Routes } from '@angular/router';
import { App } from './app/app'; // composant racine standalone

import { HomeComponent } from './app/pages/home/home.component';
import { AuthComponent } from './app/pages/auth/auth.component';
import { ProjectCreateComponent } from './app/pages/project/project-create.component';
import { ProjectViewComponent } from './app/pages/project/project-view.component';
import { ProjectListComponent } from './app/pages/project/project-list.component';
import { ProjectEditComponent } from './app/pages/project/project-edit.component';
import { ProfileComponent } from './app/pages/profile/profile.component';

import { AuthCallbackComponent } from './app/pages/auth/auth.callback';


import { AuthGuard } from './app/shared/guard/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'project', component: ProjectCreateComponent, canActivate: [AuthGuard] },
  { path: 'projects', component: ProjectListComponent, canActivate: [AuthGuard] },
  { path: 'project/:name', component: ProjectEditComponent, canActivate: [AuthGuard] },
  { path: 'project-view/:name', component: ProjectViewComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'auth/callback', component: AuthCallbackComponent },

  { path: '**', redirectTo: '' }
];

bootstrapApplication(App, {
  providers: [
    provideHttpClient(),
    provideRouter(routes)
  ]
});
