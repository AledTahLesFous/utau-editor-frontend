import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NotificationService } from './shared/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./app.css']
})
export class App implements OnInit, OnDestroy {
  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.initializeNotifications();
  }

  ngOnDestroy() {
    this.notificationService.disconnect();
  }

  private initializeNotifications() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    console.log('[App] Token:', !!token, 'UserId:', userId);

    if (token && userId) {
      console.log('[App] Connecting to WebSocket with userId:', userId);
      this.notificationService.connect(userId, token);
      this.notificationService.requestNotificationPermission();

      // Log l'état de la connexion
      this.notificationService.connectionStatus$.subscribe(status => {
        console.log('[App] WebSocket connection status:', status);
      });
    } else {
      console.log('[App] Not authenticated yet, skipping WebSocket connection');
    }
  }
}
