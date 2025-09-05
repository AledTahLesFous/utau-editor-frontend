import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = 'http://127.0.0.1:8055/items/projects';

  constructor(private http: HttpClient) {}

  createProject(projectData: any, token: string): Observable<any> {
    return this.http.post(this.apiUrl, projectData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // tu peux ajouter d'autres méthodes : getProjects, deleteProject, updateProject...
}
