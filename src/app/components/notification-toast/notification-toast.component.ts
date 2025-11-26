import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ActiveNotification } from '../../core/notification.service';

/**
 * NotificationToast Component
 * Muestra notificaciones en tiempo real en la esquina inferior derecha
 */
@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      @for (notification of notifications(); track notification.id) {
        <div
          class="notification-toast"
          [class.closing]="notification.isClosing"
        >
          <div class="notification-content">
            <p class="notification-message">{{ notification.message }}</p>
          </div>
          <button
            class="notification-close"
            (click)="close(notification.id)"
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      z-index: 9999;
      pointer-events: none;
    }

    .notification-toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #1a1a1a;
      border: 2px solid #5f0b0b;
      border-radius: 8px;
      padding: 1rem 1.25rem;
      animation: slideIn 0.3s ease-out forwards;
      pointer-events: auto;
      min-width: 300px;
      max-width: 400px;
      font-family: 'Courier New', monospace;
    }

    .notification-toast.closing {
      animation: slideOut 0.3s ease-in forwards;
    }

    @keyframes slideIn {
      from {
        transform: translateX(450px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(450px);
        opacity: 0;
      }
    }

    .notification-content {
      flex: 1;
      margin-right: 1rem;
    }

    .notification-message {
      margin: 0;
      color: #FFF;
      font-size: 0.95rem;
      font-weight: 600;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    }

    .notification-close {
      background: none;
      border: none;
      color: #FFF;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, color 0.2s;
      flex-shrink: 0;
    }

    .notification-close:hover {
      color: #5f0b0b;
      transform: scale(1.1);
    }

    .notification-close:active {
      transform: scale(0.95);
    }

    @media (max-width: 600px) {
      .notifications-container {
        bottom: 1rem;
        right: 1rem;
      }

      .notification-toast {
        min-width: 280px;
        max-width: 90vw;
      }
    }
  `]
})
export class NotificationToast {
  private readonly notificationService = inject(NotificationService);

  notifications = this.notificationService.activeNotifications;

  /**
   * Cierra una notificación
   */
  close(id: string) {
    this.notificationService.removeNotification(id);
  }
}
