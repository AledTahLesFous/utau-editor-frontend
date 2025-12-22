import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class LikeService {
  private baseUrl = 'http://localhost:8055';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  /**
   * Aimer un projet
   */
  likeProject(projectId: string, projectOwnerId: string, projectName: string): Observable<any> {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userAvatar = localStorage.getItem('userAvatar');

    return this.http.post(
      `${this.baseUrl}/items/projects/${projectId}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    ).pipe(
      tap((response) => {
        // Envoyer la notification WebSocket
        if (projectOwnerId) {
          this.notificationService.sendLike(
            projectOwnerId,
            projectId,
            'project',
            userName || 'Utilisateur',
            userAvatar || undefined
          );
        }
        console.log('[LikeService] Like sent for project:', projectId);
      })
    );
  }

  /**
   * Ne plus aimer un projet
   */
  unlikeProject(projectId: string, projectOwnerId: string): Observable<any> {
    const token = localStorage.getItem('token');

    return this.http.post(
      `${this.baseUrl}/items/projects/${projectId}/unlike`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    ).pipe(
      tap((response) => {
        // Envoyer la notification de unlike
        if (projectOwnerId) {
          this.notificationService.sendUnlike(
            projectOwnerId,
            projectId,
            'project'
          );
        }
        console.log('[LikeService] Unlike sent for project:', projectId);
      })
    );
  }

  /**
   * Aimer une note
   */
  likeNote(noteId: string, noteOwnerId: string, noteName: string): Observable<any> {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userAvatar = localStorage.getItem('userAvatar');

    return this.http.post(
      `${this.baseUrl}/items/notes/${noteId}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    ).pipe(
      tap((response) => {
        if (noteOwnerId) {
          this.notificationService.sendLike(
            noteOwnerId,
            noteId,
            'note',
            userName || 'Utilisateur',
            userAvatar || undefined
          );
        }
        console.log('[LikeService] Like sent for note:', noteId);
      })
    );
  }

  /**
   * Ne plus aimer une note
   */
  unlikeNote(noteId: string, noteOwnerId: string): Observable<any> {
    const token = localStorage.getItem('token');

    return this.http.post(
      `${this.baseUrl}/items/notes/${noteId}/unlike`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    ).pipe(
      tap((response) => {
        if (noteOwnerId) {
          this.notificationService.sendUnlike(
            noteOwnerId,
            noteId,
            'note'
          );
        }
        console.log('[LikeService] Unlike sent for note:', noteId);
      })
    );
  }

  /**
   * Obtenir le nombre de likes
   */
  getLikeCount(itemType: string, itemId: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/items/${itemType}/${itemId}/likes`
    );
  }

  /**
   * Vérifier si l'utilisateur a aimé
   */
  isLikedByMe(itemType: string, itemId: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get(
      `${this.baseUrl}/items/${itemType}/${itemId}/liked-by-me`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
}
