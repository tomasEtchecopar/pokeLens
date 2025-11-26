import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../core/notification.service';

/**
 * NotificationMenu Component
 * Muestra el historial de notificaciones
 */
@Component({
  selector: 'app-notification-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-menu-wrapper">
      <!-- Botón para abrir/cerrar menú (usa estilos de botones del header) -->
      <button
        class="btn-header notification-btn"
        (click)="toggleMenu()"
        [class.has-items]="history().length > 0"
        title="Ver historial de notificaciones"
      >
        <span class="bell-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 2a4 4 0 0 0-4 4v1.1C6.7 8.2 6 9.6 6 11v3l-1.7 1.7A1 1 0 0 0 5 18h14a1 1 0 0 0 .7-1.7L18 14v-3c0-1.4-.7-2.8-2-3.9V6a4 4 0 0 0-4-4zm0 20a2.5 2.5 0 0 0 2.45-2H9.55A2.5 2.5 0 0 0 12 22z" />
          </svg>
        </span>
        @if (history().length > 0) {
          <span class="badge">{{ history().length }}</span>
        }
      </button>

      <!-- Menú desplegable -->
      @if (isOpen()) {
        <div class="menu-overlay" (click)="closeMenu()"></div>
        <div class="notification-menu">
          <div class="menu-header">
            <h3>Notificaciones</h3>
            @if (history().length > 0) {
              <button
                class="clear-all-btn"
                (click)="clearAll()"
                title="Eliminar todas las notificaciones"
              >
                Limpiar todo
              </button>
            }
          </div>

          <div class="menu-content">
            @if (history().length === 0) {
              <div class="empty-state">
                <p>Sin notificaciones</p>
              </div>
            } @else {
              <ul class="notification-list">
                @for (notification of history(); track notification.id) {
                  <li class="notification-item">
                    <div class="item-content">
                      <p class="item-message">{{ notification.message }}</p>
                      <p class="item-time">{{ formatTime(notification.timestamp) }}</p>
                    </div>
                    <button
                      class="item-remove"
                      (click)="removeItem(notification.id)"
                      title="Eliminar notificación"
                    >
                      ✕
                    </button>
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-btn {
        position: relative;
  box-sizing: border-box;
  height: 46px;
  background: #2c2c2c;
  min-width: 72px;
  color: white;
  border: 3px solid #1a1a1a;
  padding: 0.5rem 1rem;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 0 #1a1a1a;
    display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
    }

    .notification-btn:hover {
      transform: translateY(-2px);
    }

    .bell-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      line-height: 0;
      color: currentColor; /* inherit color from .btn-header */
    }

    .bell-icon svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
      display: block;
    }

    .badge {
      position: absolute;
      top: -6px;
      right: -6px;
      background: #FFF;
      color: #000;
      min-width: 18px;
      height: 18px;
      padding: 0 4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 800;
      box-shadow: 0 1px 0 rgba(0,0,0,0.2);
    }

    .menu-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 999;
    }

    .notification-menu {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.5rem;
      background: #1a1a1a;
      border: 2px solid #5f0b0b;
      z-index: 1000;
      width: 350px;
      max-height: 500px;
      display: flex;
      flex-direction: column;
      animation: slideDown 0.3s ease-out;
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

    .menu-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: #5f0b0b 2px solid;
      flex-shrink: 0;
    }

    .menu-header h3 {
      margin: 0;
      color: #FFF;
      font-size: 1.1rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .clear-all-btn {
      background: none;
      border: 1px solid #FFF;
      color: #FFF;
      padding: 0.4rem 0.8rem;
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 700;
      transition: all 0.2s;
    }

    .clear-all-btn:hover {
      background: #5f0b0b;
      color: #000;
    }

    .menu-content {
      flex: 1;
      overflow-y: auto;
      font-family: 'Courier New', monospace;
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 120px;
      color: #999;
      font-size: 0.9rem;
    }

    .notification-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .notification-item {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 0.75rem 1rem;
      border-bottom: #5f0b0b 1px solid;
      transition: background 0.2s;
    }

    .notification-item:hover {
      background: #5f0b0b23;
    }

    .notification-item:last-child {
      border-bottom: none;
    }

    .item-content {
      flex: 1;
      margin-right: 0.75rem;
    }

    .item-message {
      margin: 0;
      color: #FFF;
      font-size: 0.9rem;
      font-weight: 600;
      line-height: 1.4;
      word-break: break-word;
    }

    .item-time {
      margin: 0.25rem 0 0 0;
      color: #999;
      font-size: 0.8rem;
      font-weight: 400;
    }

    .item-remove {
      background: none;
      border: none;
      color: #FFF;
      cursor: pointer;
      font-size: 1rem;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s, transform 0.2s;
      flex-shrink: 0;
    }

    .item-remove:hover {
      color: #5f0b0b;
      transform: scale(1.1);
    }

    @media (max-width: 600px) {
      .notification-menu {
        width: 280px;
        max-height: 400px;
      }
    }
  `]
})
export class NotificationMenu {
  private readonly notificationService = inject(NotificationService);

  isOpen = signal(false);
  history = this.notificationService.notificationHistory;

  /**
   * Abre/cierra el menú
   */
  toggleMenu() {
    this.isOpen.update(v => !v);
  }

  /**
   * Cierra el menú
   */
  closeMenu() {
    this.isOpen.set(false);
  }

  /**
   * Elimina una notificación del historial
   */
  removeItem(id: string) {
    this.notificationService.removeFromHistory(id);
  }

  /**
   * Limpia todo el historial
   */
  clearAll() {
    if (confirm('¿Deseas eliminar todas las notificaciones?')) {
      this.notificationService.clearHistory();
      this.closeMenu();
    }
  }

  /**
   * Formatea la hora de la notificación
   */
  formatTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 60) {
      return 'Hace unos segundos';
    } else if (diffMins < 60) {
      return `Hace ${diffMins} min${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours}h`;
    } else {
      return new Date(date).toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}
