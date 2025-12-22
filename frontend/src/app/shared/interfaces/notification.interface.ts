/**
 * Types et Interfaces pour le système de notifications WebSocket
 */

/**
 * Notification de like reçue
 */
export interface LikeNotification {
  fromUserId: string;           // ID de l'utilisateur qui a aimé
  fromUserName: string;         // Nom d'affichage
  fromUserAvatar?: string;      // URL de l'avatar (optionnel)
  itemId: string;               // ID de l'élément aimé
  itemType: string;             // Type d'élément (project, note, etc.)
  timestamp: Date;              // Moment du like
  message: string;              // Message de notification
  read?: boolean;               // Statut de lecture
}

/**
 * Notification de unlike reçue
 */
export interface UnlikeNotification {
  fromUserId: string;           // ID de l'utilisateur qui a annulé le like
  itemId: string;               // ID de l'élément
  itemType: string;             // Type d'élément
  timestamp: Date;              // Moment de l'unlike
}

/**
 * Payload envoyé au serveur WebSocket pour un like
 */
export interface LikePayload {
  fromUserId: string;
  toUserId: string;             // ID du destinataire (propriétaire de l'élément)
  itemId: string;
  itemType: string;
  fromUserName: string;
  fromUserAvatar?: string;
}

/**
 * Payload envoyé au serveur WebSocket pour un unlike
 */
export interface UnlikePayload {
  fromUserId: string;
  toUserId: string;
  itemId: string;
  itemType: string;
}

/**
 * Réponse du serveur WebSocket
 */
export interface NotificationResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Configuration du service de notification
 */
export interface NotificationConfig {
  wsUrl: string;                // URL du serveur WebSocket
  reconnectionDelay?: number;   // Délai de reconnexion en ms
  reconnectionDelayMax?: number;// Délai max de reconnexion en ms
  reconnectionAttempts?: number;// Nombre de tentatives de reconnexion
}

/**
 * État d'une notification
 */
export enum NotificationStatus {
  Unread = 'unread',
  Read = 'read',
  Archived = 'archived'
}

/**
 * Types d'éléments pouvant être aimés
 */
export enum ItemType {
  Project = 'project',
  Note = 'note',
  Comment = 'comment',
  Page = 'page',
  VoiceBank = 'voicebank'
}

/**
 * Événements WebSocket disponibles
 */
export enum WebSocketEvents {
  // Côté client - réception
  Connect = 'connect',
  Disconnect = 'disconnect',
  LikeNotification = 'like-notification',
  UnlikeNotification = 'unlike-notification',
  OfflineNotifications = 'offline-notifications',
  Identified = 'identified',
  Error = 'error',
  NotificationMarkedRead = 'notification-marked-read',
  
  // Côté client - émission
  Identify = 'identify',
  Like = 'like',
  Unlike = 'unlike',
  MarkNotificationRead = 'mark-notification-read',
  GetOfflineNotifications = 'get-offline-notifications'
}

/**
 * Options pour envoyer un like
 */
export interface SendLikeOptions {
  toUserId: string;
  itemId: string;
  itemType: ItemType | string;
  fromUserName: string;
  fromUserAvatar?: string;
  metadata?: Record<string, any>;  // Données supplémentaires optionnelles
}

/**
 * Options pour envoyer un unlike
 */
export interface SendUnlikeOptions {
  toUserId: string;
  itemId: string;
  itemType: ItemType | string;
}

/**
 * Filtre pour les notifications
 */
export interface NotificationFilter {
  fromUserId?: string;
  itemId?: string;
  itemType?: ItemType | string;
  read?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Résultat de filtrage
 */
export interface FilteredNotifications {
  notifications: LikeNotification[];
  total: number;
  filtered: number;
}

/**
 * Statistiques des notifications
 */
export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byType: Map<string, number>;
  byUser: Map<string, number>;
}

/**
 * État du service de notification
 */
export interface NotificationServiceState {
  isConnected: boolean;
  userId: string | null;
  notifications: LikeNotification[];
  unreadCount: number;
  lastError?: string;
  lastErrorTime?: Date;
}

/**
 * Événement de notification custom
 */
export class NotificationEvent {
  constructor(
    public type: 'like' | 'unlike' | 'read' | 'cleared',
    public notification?: LikeNotification | UnlikeNotification,
    public timestamp = new Date()
  ) {}
}

/**
 * Cache local pour les notifications
 */
export interface NotificationCache {
  notifications: Map<string, LikeNotification>;
  lastUpdated: Date;
  size: number;
}

/**
 * Configuration de persistence pour les notifications hors ligne
 */
export interface PersistenceConfig {
  enabled: boolean;
  storageKey?: string;
  maxItems?: number;
}

/**
 * Réponse d'identification du serveur
 */
export interface IdentificationResponse {
  success: boolean;
  message: string;
  userId?: string;
  socketId?: string;
}

/**
 * Information de connexion WebSocket
 */
export interface ConnectionInfo {
  socketId: string;
  userId: string;
  connectedAt: Date;
  isActive: boolean;
  lastActivity: Date;
}
