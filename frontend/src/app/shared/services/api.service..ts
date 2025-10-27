  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { Observable } from 'rxjs';
  import { Projet } from '../interfaces/project.interface'; // adapte aussi

  @Injectable({
    providedIn: 'root'
  })
  export class Api {

    private baseUrl = 'http://127.0.0.1:8055';

    constructor(private http: HttpClient) {}

    // ---------------- Auth ----------------

    login(email: string, password: string): Observable<any> {
      return this.http.post<any>(`${this.baseUrl}/auth/login`, { email, password });
    }

    registerUser(userData: { first_name: string; email: string; password: string }): Observable<any> {
      return this.http.post(`${this.baseUrl}/users/register`, userData);
    }

    getMe(token: string): Observable<any> {
      return this.http.get(`${this.baseUrl}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    // ---------------- Users ----------------


    updateMe(userData: any, token: string): Observable<any> {
      return this.http.patch(`${this.baseUrl}/users/me`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    // ---------------- Projects ----------------

    getProjects(): Observable<{ data: Projet[] }> {
      return this.http.get<{ data: Projet[] }>(`${this.baseUrl}/items/projects`);
    }

    createProject(projectData: any, token: string): Observable<any> {
      return this.http.post(`${this.baseUrl}/items/projects`, projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    getProjectByName(name: string): Observable<any> {
      return this.http.get(`${this.baseUrl}/items/projects/${name}`);
    }

    updateProject(name: string, projectData: any, token: string): Observable<any> {
      return this.http.patch(`${this.baseUrl}/items/projects/${name}`, projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    deleteProject(name: string, token: string): Observable<any> {
      return this.http.delete(`${this.baseUrl}/items/projects/${name}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }


  // ---------------- Notes ----------------

  getNotesByProject(projectId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/items/notes?filter[project_id][_eq]=${projectId}`);
  }

  addNote(noteData: any, token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/items/notes`, noteData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  updateNote(noteId: string, noteData: any, token: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/items/notes/${noteId}`, noteData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  deleteNote(noteId: string, token: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/items/notes/${noteId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // ---------------- Phonèmes ----------------

  getAllPhonemes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/items/phonemes`);
  }

  getPhonemesByIds(ids: string[]): Observable<any> {
    const idFilter = ids.join(',');
    return this.http.get(`${this.baseUrl}/items/phonemes?filter[id][_in]=${idFilter}`);
  }

  // ---------------- Project par nom ----------------

  getProjectByTitle(title: string, token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/items/projects?filter[title][_eq]=${title}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  updateProjectById(projectId: string, projectData: any, token: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/items/projects/${projectId}`, projectData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

getVoicebanks(token: string): Observable<any> {
  return this.http.get(`${this.baseUrl}/items/voicebanks`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}





  }
