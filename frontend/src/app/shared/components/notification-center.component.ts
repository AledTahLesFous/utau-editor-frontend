import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, LikeNotification } from '../services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <!-- Bouton notification -->
      <button
        (click)="togglePanel()"
        class="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-110"
        title="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        <span
          *ngIf="unreadCount > 0"
          class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full w-5 h-5 animate-pulse"
        >
          {{ unreadCount }}
        </span>
      </button>

      <!-- Panneau notifications -->
      <div
        *ngIf="isOpen"
        class="fixed inset-0 z-40 md:absolute md:inset-auto md:top-full md:right-0 md:mt-2 md:w-96 md:max-h-96 bg-white border border-gray-200 rounded-lg shadow-lg md:shadow-xl overflow-hidden flex flex-col transition-all duration-200 ease-out transform origin-top-right"
        [class.animate-in]="isOpen"
        [class.fade-in]="isOpen"
      >
        <!-- Header -->
        <div class="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
          <h2 class="text-lg font-semibold text-gray-900">Notifications</h2>
          <div class="flex gap-2">
            <button
              *ngIf="notifications.length > 0"
              (click)="markAllAsRead()"
              class="p-1 text-gray-600 hover:bg-gray-200 rounded transition-colors"
              title="Marquer tout comme lu"
            >
              ✓
            </button>
            <button
              *ngIf="notifications.length > 0"
              (click)="clearAll()"
              class="p-1 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
              title="Supprimer tout"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Liste notifications -->
        <div class="flex-1 overflow-y-auto">
          <div *ngIf="notifications.length === 0" class="flex items-center justify-center h-48 text-gray-400 text-sm">
            Aucune notification
          </div>

          <div
            *ngFor="let notification of notifications; let i = index"
            class="flex gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
            [class.bg-blue-50]="!notification.read"
            [class.border-l-4]="!notification.read"
            [class.border-l-blue-500]="!notification.read"
            [class.opacity-100]="true"
            [@.disabled]
            [style.animation]="'fadeIn ' + (300 + i * 50) + 'ms ease-out'"
          >
            <!-- Emoji icon -->
            <div class="text-2xl flex-shrink-0 mt-1">
              <span>👍</span>
            </div>

            <!-- Contenu -->
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-900 leading-snug break-words">{{ notification.message }}</p>
              <span class="text-xs text-gray-500 mt-1 block">{{ formatTime(notification.timestamp) }}</span>
            </div>

            <!-- Actions -->
            <div class="flex gap-1 flex-shrink-0">
              <button
                *ngIf="!notification.read"
                (click)="markAsRead(notification.itemId!)"
                class="p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded transition-colors"
                title="Marquer comme lu"
              >
                ●
              </button>
              <button
                (click)="markAsRead(notification.itemId!)"
                class="p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                title="Marquer comme lu"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Overlay mobile -->
      <div
        *ngIf="isOpen"
        (click)="togglePanel()"
        class="fixed inset-0 z-30 bg-black/20 md:hidden"
      ></div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateX(-10px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-in {
      animation: slideDown 200ms ease-out;
    }

    .fade-in {
      animation: fadeIn 300ms ease-out;
    }
  `]
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  notifications: LikeNotification[] = [];
  unreadCount = 0;
  isOpen = false;
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // S'abonner aux notifications
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });

    // S'abonner au compte de non-lus
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });

    // Demander la permission pour les notifications du navigateur
    this.notificationService.requestNotificationPermission();
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  clearAll(): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications ?')) {
      this.notificationService.clearNotifications();
    }
  }

  formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `il y a ${minutes}m`;
    if (hours < 24) return `il y a ${hours}h`;
    if (days < 7) return `il y a ${days}j`;

    return d.toLocaleDateString('fr-FR');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
