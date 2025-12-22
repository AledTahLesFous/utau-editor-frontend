import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface LikeNotification {
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  itemId: string;
  itemType: string;
  timestamp: Date;
  message: string;
  read?: boolean;
}

export interface UnlikeNotification {
  fromUserId: string;
  itemId: string;
  itemType: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private socket: Socket | null = null;
  private notificationsSubject = new BehaviorSubject<LikeNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private wsUrl = 'http://localhost:3001';
  private currentUserId: string | null = null;
  private currentToken: string | null = null;

  constructor(private ngZone: NgZone) {}

  /**
   * Initialiser la connexion WebSocket
   */
  connect(userId: string, token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.currentUserId = userId;
    this.currentToken = token;

    this.ngZone.runOutsideAngular(() => {
      this.socket = io(this.wsUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      // Événement de connexion
      this.socket.on('connect', () => {
        console.log('Connected to notification server');
        this.ngZone.run(() => {
          this.connectionStatusSubject.next(true);
        });

        // Envoyer l'identification utilisateur
        this.socket!.emit('identify', { userId, token });
      });

      // Événement d'identification
      this.socket.on('identified', (data) => {
        console.log('Identified on server:', data);
        this.ngZone.run(() => {
          this.loadOfflineNotifications();
        });
      });

      // Réception d'une notification de like
      this.socket.on('like-notification', (notification: LikeNotification) => {
        console.log('Like notification received:', notification);
        this.ngZone.run(() => {
          this.addNotification(notification);
        });
      });

      // Réception d'une notification de unlike
      this.socket.on('unlike-notification', (notification: UnlikeNotification) => {
        console.log('Unlike notification received:', notification);
        this.ngZone.run(() => {
          this.removeNotification(notification.itemId);
        });
      });

      // Notifications hors ligne
      this.socket.on('offline-notifications', (data: { notifications: LikeNotification[] }) => {
        console.log('Offline notifications loaded:', data.notifications);
        this.ngZone.run(() => {
          data.notifications.forEach(notif => this.addNotification(notif));
        });
      });

      // Erreurs
      this.socket.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.ngZone.run(() => {
          this.connectionStatusSubject.next(false);
        });
      });

      // Déconnexion
      this.socket.on('disconnect', () => {
        console.log('Disconnected from notification server');
        this.ngZone.run(() => {
          this.connectionStatusSubject.next(false);
        });
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
    });
  }

  /**
   * Envoyer une notification de like
   */
  sendLike(toUserId: string, itemId: string, itemType: string, fromUserName: string, fromUserAvatar?: string): void {
    if (!this.socket?.connected || !this.currentUserId) {
      console.warn('WebSocket not connected or user not identified');
      return;
    }

    this.socket.emit('like', {
      fromUserId: this.currentUserId,
      toUserId,
      itemId,
      itemType,
      fromUserName,
      fromUserAvatar
    });
  }

  /**
   * Envoyer une notification de unlike
   */
  sendUnlike(toUserId: string, itemId: string, itemType: string): void {
    if (!this.socket?.connected || !this.currentUserId) {
      console.warn('WebSocket not connected or user not identified');
      return;
    }

    this.socket.emit('unlike', {
      fromUserId: this.currentUserId,
      toUserId,
      itemId,
      itemType
    });
  }

  /**
   * Ajouter une notification à la liste
   */
  private addNotification(notification: LikeNotification): void {
    const currentNotifications = this.notificationsSubject.value;
    
    // Éviter les doublons
    const exists = currentNotifications.some(
      n => n.fromUserId === notification.fromUserId && 
           n.itemId === notification.itemId &&
           n.itemType === notification.itemType
    );
    
    if (!exists) {
      const newNotification = {
        ...notification,
        read: false,
        timestamp: new Date(notification.timestamp)
      };
      
      this.notificationsSubject.next([newNotification, ...currentNotifications]);
      this.updateUnreadCount();
      
      // Afficher une notification du système
      this.showSystemNotification(notification.message);
    }
  }

  /**
   * Supprimer une notification (unlike)
   */
  private removeNotification(itemId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filtered = currentNotifications.filter(n => n.itemId !== itemId);
    this.notificationsSubject.next(filtered);
    this.updateUnreadCount();
  }

  /**
   * Marquer une notification comme lue
   */
  markAsRead(itemId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updated = currentNotifications.map(n => 
      n.itemId === itemId ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(updated);
    this.updateUnreadCount();

    if (this.socket?.connected) {
      this.socket.emit('mark-notification-read', { notificationId: itemId });
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllAsRead(): void {
    const currentNotifications = this.notificationsSubject.value;
    const updated = currentNotifications.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(updated);
    this.updateUnreadCount();
  }

  /**
   * Mettre à jour le nombre de notifications non lues
   */
  private updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  /**
   * Charger les notifications hors ligne
   */
  private loadOfflineNotifications(): void {
    if (this.socket?.connected && this.currentUserId) {
      this.socket.emit('get-offline-notifications', { userId: this.currentUserId });
    }
  }

  /**
   * Afficher une notification système (optionnel, nécessite une API de notification)
   */
  private showSystemNotification(message: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Nouvelle notification', {
        body: message,
        icon: '/assets/notification-icon.png'
      });
    }
  }

  /**
   * Demander la permission pour les notifications système
   */
  requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  /**
   * Obtenir toutes les notifications
   */
  getNotifications(): Observable<LikeNotification[]> {
    return this.notifications$;
  }

  /**
   * Obtenir le nombre de notifications non lues
   */
  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }

  /**
   * Vérifier l'état de la connexion
   */
  isConnected(): Observable<boolean> {
    return this.connectionStatus$;
  }

  /**
   * Déconnecter le WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatusSubject.next(false);
    }
  }

  /**
   * Effacer toutes les notifications
   */
  clearNotifications(): void {
    this.notificationsSubject.next([]);
    this.updateUnreadCount();
  }
}
