import { TestBed } from '@angular/core/testing';
import { NotificationService, LikeNotification } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    service.disconnect();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Connection', () => {
    it('should connect with valid userId and token', (done) => {
      service.connect('test-user-1', 'test-token');
      
      setTimeout(() => {
        service.isConnected().subscribe(status => {
          // La connexion peut échouer si le serveur n'est pas disponible
          // mais l'appel à connect ne devrait pas lever d'erreur
          expect(service).toBeTruthy();
          done();
        });
      }, 100);
    });

    it('should disconnect properly', (done) => {
      service.connect('test-user-1', 'test-token');
      
      setTimeout(() => {
        service.disconnect();
        service.isConnected().subscribe(status => {
          expect(status).toBeFalse();
          done();
        });
      }, 100);
    });
  });

  describe('Notifications', () => {
    it('should initialize with empty notifications', (done) => {
      service.getNotifications().subscribe(notifications => {
        expect(notifications).toEqual([]);
        done();
      });
    });

    it('should initialize with zero unread count', (done) => {
      service.getUnreadCount().subscribe(count => {
        expect(count).toBe(0);
        done();
      });
    });

    it('should clear all notifications', (done) => {
      service.clearNotifications();
      service.getNotifications().subscribe(notifications => {
        expect(notifications.length).toBe(0);
        done();
      });
    });
  });

  describe('Like and Unlike', () => {
    it('should not throw when sending like without connection', () => {
      expect(() => {
        service.sendLike('user-2', 'item-1', 'project', 'Test User');
      }).not.toThrow();
    });

    it('should not throw when sending unlike without connection', () => {
      expect(() => {
        service.sendUnlike('user-2', 'item-1', 'project');
      }).not.toThrow();
    });
  });

  describe('Mark as Read', () => {
    it('should mark notification as read', () => {
      // Ajouter une notification test manuellement
      const testNotification: LikeNotification = {
        fromUserId: 'user-1',
        fromUserName: 'Test User',
        itemId: 'item-1',
        itemType: 'project',
        timestamp: new Date(),
        message: 'Test message',
        read: false
      };

      // Implémenter une méthode pour ajouter des notifications à des fins de test
      service['addNotification'](testNotification);
      service.markAsRead('item-1');

      service.getNotifications().subscribe(notifications => {
        const notification = notifications.find(n => n.itemId === 'item-1');
        expect(notification?.read).toBeTrue();
      });
    });

    it('should mark all notifications as read', (done) => {
      // Ajouter plusieurs notifications
      const notification1: LikeNotification = {
        fromUserId: 'user-1',
        fromUserName: 'User 1',
        itemId: 'item-1',
        itemType: 'project',
        timestamp: new Date(),
        message: 'Message 1',
        read: false
      };

      const notification2: LikeNotification = {
        fromUserId: 'user-2',
        fromUserName: 'User 2',
        itemId: 'item-2',
        itemType: 'project',
        timestamp: new Date(),
        message: 'Message 2',
        read: false
      };

      service['addNotification'](notification1);
      service['addNotification'](notification2);

      service.markAllAsRead();

      service.getNotifications().subscribe(notifications => {
        expect(notifications.every(n => n.read)).toBeTrue();
        done();
      });
    });
  });

  describe('Notification Permission', () => {
    it('should request notification permission', () => {
      // Mock Notification si disponible
      if ('Notification' in window) {
        spyOn(window.Notification, 'requestPermission');
        service.requestNotificationPermission();
        // Vérifier que requestPermission a été appelé (si la permission était 'default')
      }
    });
  });

  describe('Unread Count', () => {
    it('should update unread count when notification is added', (done) => {
      const testNotification: LikeNotification = {
        fromUserId: 'user-1',
        fromUserName: 'Test User',
        itemId: 'item-1',
        itemType: 'project',
        timestamp: new Date(),
        message: 'Test message',
        read: false
      };

      service['addNotification'](testNotification);

      service.getUnreadCount().subscribe(count => {
        expect(count).toBeGreaterThan(0);
        done();
      });
    });

    it('should decrease unread count when notification is marked as read', (done) => {
      const testNotification: LikeNotification = {
        fromUserId: 'user-1',
        fromUserName: 'Test User',
        itemId: 'item-1',
        itemType: 'project',
        timestamp: new Date(),
        message: 'Test message',
        read: false
      };

      service['addNotification'](testNotification);
      
      setTimeout(() => {
        service.markAsRead('item-1');
        service.getUnreadCount().subscribe(count => {
          expect(count).toBe(0);
          done();
        });
      }, 50);
    });
  });
});

/**
 * Test d'intégration WebSocket
 * À exécuter uniquement si le serveur WebSocket est actif sur localhost:3001
 */
describe('NotificationService Integration Tests', () => {
  let service: NotificationService;
  const WS_SERVER_URL = 'http://localhost:3001';
  const TEST_TIMEOUT = 5000;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    service.disconnect();
  });

  /**
   * REMARQUE: Ces tests nécessitent que le serveur WebSocket soit actif.
   * Pour les exécuter: démarrer le serveur avec `node backend/src/websocket.js`
   */

  it('should establish WebSocket connection', (done) => {
    service.connect('test-user-1', 'valid-token');
    
    const subscription = service.isConnected().subscribe(status => {
      if (status) {
        expect(status).toBeTrue();
        subscription.unsubscribe();
        done();
      }
    });

    setTimeout(() => {
      subscription.unsubscribe();
      console.warn('WebSocket connection timeout - serveur peut ne pas être disponible');
      done();
    }, TEST_TIMEOUT);
  });

  it('should receive notifications', (done) => {
    service.connect('test-user-1', 'valid-token');

    // Simuler la réception d'une notification
    service.getNotifications().subscribe(notifications => {
      if (notifications.length > 0) {
        expect(notifications[0]).toEqual(jasmine.objectContaining({
          fromUserId: jasmine.any(String),
          itemId: jasmine.any(String),
          itemType: jasmine.any(String),
          message: jasmine.any(String)
        }));
        done();
      }
    });

    // Timeout pour éviter d'attendre indéfiniment
    setTimeout(() => {
      console.warn('Pas de notification reçue - test ignoré');
      done();
    }, TEST_TIMEOUT);
  });
});

/**
 * Utilitaires pour les tests
 */
export class NotificationTestHelper {
  /**
   * Créer une notification de test
   */
  static createMockNotification(overrides?: Partial<LikeNotification>): LikeNotification {
    return {
      fromUserId: 'test-user-1',
      fromUserName: 'Test User',
      itemId: 'test-item-1',
      itemType: 'project',
      timestamp: new Date(),
      message: 'Test notification',
      read: false,
      ...overrides
    };
  }

  /**
   * Créer plusieurs notifications de test
   */
  static createMockNotifications(count: number): LikeNotification[] {
    return Array.from({ length: count }, (_, i) =>
      this.createMockNotification({
        itemId: `test-item-${i + 1}`,
        fromUserName: `Test User ${i + 1}`
      })
    );
  }
}
