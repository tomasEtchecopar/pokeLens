import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  message: string;
  timestamp: Date;
  duration?: number; // en milisegundos
}

export interface ActiveNotification extends Notification {
  isClosing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Notificaciones activas (toasts)
  activeNotifications = signal<ActiveNotification[]>([]);

  // Historial de notificaciones
  notificationHistory = signal<Notification[]>([]);

  // Configuración
  private readonly DEFAULT_DURATION = 5000; // 5 segundos
  private readonly MAX_HISTORY = 100;
  private notificationCounter = 0;

  /**
   * Muestra una notificación
   */
  notify(message: string, duration = this.DEFAULT_DURATION) {
    const id = this.generateId();
    const timestamp = new Date();

    const notification: ActiveNotification = {
      id,
      message,
      timestamp,
      duration
    };

    // Agregar a activos
    this.activeNotifications.update(current => [...current, notification]);

    // Agregar a historial
    this.addToHistory({ id, message, timestamp, duration });

    // Auto-remover después del tiempo especificado
    setTimeout(() => {
      this.removeNotification(id);
    }, duration);

    return id;
  }

  /**
   * Elimina una notificación activa
   */
  removeNotification(id: string) {
    this.activeNotifications.update(current =>
      current.filter(n => n.id !== id)
    );
  }

  /**
   * Agrega una notificación al historial
   */
  private addToHistory(notification: Notification) {
    this.notificationHistory.update(current => {
      const updated = [notification, ...current];
      // Limitar historial a MAX_HISTORY
      return updated.slice(0, this.MAX_HISTORY);
    });
  }

  /**
   * Limpia el historial
   */
  clearHistory() {
    this.notificationHistory.set([]);
  }

  /**
   * Elimina una notificación del historial
   */
  removeFromHistory(id: string) {
    this.notificationHistory.update(current =>
      current.filter(n => n.id !== id)
    );
  }

  /**
   * Genera un ID único para cada notificación
   */
  private generateId(): string {
    return `notification-${++this.notificationCounter}-${Date.now()}`;
  }

  /**
   * Obtiene el historial
   */
  getHistory() {
    return this.notificationHistory();
  }

  /**
   * Obtiene notificaciones activas
   */
  getActive() {
    return this.activeNotifications();
  }

  /**
   * Limpia todas las notificaciones (activas + historial)
   * Usar al cerrar sesión o cambiar de usuario
   */
  clearAll() {
    this.activeNotifications.set([]);
    this.notificationHistory.set([]);
  }


}
