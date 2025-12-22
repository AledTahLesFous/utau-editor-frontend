import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, LikeNotification } from '../services/notification.service';
import { ClickOutsideDirective } from '../directives/click-outside.directive';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notifications-panel',
  standalone: true,
  imports: [CommonModule, ClickOutsideDirective],
  templateUrl: './notifications-panel.component.html',
  styleUrls: ['./notifications-panel.component.css']
})
export class NotificationsPanelComponent implements OnInit, OnDestroy {
  notifications: LikeNotification[] = [];
  unreadCount = 0;
  isOpen = false;
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // S'abonner aux notifications
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });

    // S'abonner au compteur de notifications non lues
    this.notificationService.getUnreadCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.notificationService.markAllAsRead();
    }
  }

  closePanel(): void {
    this.isOpen = false;
  }

  clearNotifications(): void {
    this.notificationService.clearNotifications();
  }

  openNotificationDetails(notification: LikeNotification): void {
    this.notificationService.markAsRead(notification.itemId);
    // Naviguer vers l'item ou afficher plus de détails
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now.getTime() - notifTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}j`;
  }
}
