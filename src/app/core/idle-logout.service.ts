import { Injectable, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, Subscription, timer } from 'rxjs';
import { filter, startWith, switchMap, tap } from 'rxjs/operators';
import { AuthServ } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class IdleLogoutService {
  private readonly auth = inject(AuthServ);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private readonly notification = inject(NotificationService);

  private sub?: Subscription;


  private readonly IDLE_MS = 2 * 60 * 60 * 1000;     // 2 horas
  private readonly REAUTH_MS = 24 * 60 * 60 * 1000;  // 24 horas

  private readonly KEY_LAST_ACTIVITY = 'pl_last_activity_at';
  private readonly KEY_SESSION_START = 'pl_session_start_at';

  private readonly LOGIN_ROUTE = '/home';

  start() {
    this.stop();

    // Asegura marcadores si ya hay sesión restaurada
    this.ensureSessionMarkers();

    this.zone.runOutsideAngular(() => {
      const activity$ = merge(
        fromEvent(window, 'mousemove'),
        fromEvent(window, 'mousedown'),
        fromEvent(window, 'keydown'),
        fromEvent(window, 'scroll'),
        fromEvent(window, 'touchstart'),
        fromEvent(document, 'visibilitychange') // al volver a la pestaña
      ).pipe(startWith(null));

      this.sub = activity$
        .pipe(
          tap(() => {
            // 1) si volvió luego de X tiempo, acá lo detecta
            this.validateOrLogout();

            // 2) si sigue logueado, registramos actividad
            if (this.auth.activeUser()) {
              this.markActivity();
            }
          }),
          filter(() => !!this.auth.activeUser()),
          switchMap(() => timer(this.IDLE_MS)),
          tap(() => {
            // Se cumplió el idle timer sin actividad
            this.zone.run(() => this.forceLogout('Sesión cerrada por inactividad.'));
          })
        )
        .subscribe();
    });
  }

  stop() {
    this.sub?.unsubscribe();
    this.sub = undefined;
  }

  onLoginSuccess() {
    const now = Date.now();
    localStorage.setItem(this.KEY_SESSION_START, String(now));
    localStorage.setItem(this.KEY_LAST_ACTIVITY, String(now));
  }

  onLogout() {
    localStorage.removeItem(this.KEY_SESSION_START);
    localStorage.removeItem(this.KEY_LAST_ACTIVITY);
  }

  private ensureSessionMarkers() {
    if (!this.auth.activeUser()) return;

    const now = Date.now();
    if (!localStorage.getItem(this.KEY_SESSION_START)) {
      localStorage.setItem(this.KEY_SESSION_START, String(now));
    }
    if (!localStorage.getItem(this.KEY_LAST_ACTIVITY)) {
      localStorage.setItem(this.KEY_LAST_ACTIVITY, String(now));
    }
  }

  private markActivity() {
    localStorage.setItem(this.KEY_LAST_ACTIVITY, String(Date.now()));
  }

  private validateOrLogout() {
    if (!this.auth.activeUser()) return;

    const now = Date.now();
    const startRaw = localStorage.getItem(this.KEY_SESSION_START);
    const lastRaw = localStorage.getItem(this.KEY_LAST_ACTIVITY);

    // ✅ Si faltan marcadores, NO desloguea: los crea y listo
    if (!startRaw || !lastRaw) {
      this.ensureSessionMarkers();
      return;
    }

    const start = Number(startRaw);
    const last = Number(lastRaw);

    // ✅ Si están corruptos, los resetea sin romper
    if (!start || !last) {
      this.onLoginSuccess();
      return;
    }

    const idleFor = now - last;
    const sessionFor = now - start;

    if (idleFor >= this.IDLE_MS) {
      this.zone.run(() => this.forceLogout('Sesión cerrada por inactividad.'));
      return;
    }

    if (sessionFor >= this.REAUTH_MS) {
      this.zone.run(() => this.forceLogout('Por seguridad, volvé a iniciar sesión (cada 24h).'));
      return;
    }
  }

  private forceLogout(msg: string) {
    // ✅ anti-loop: si ya estás en la pantalla de login, no redirige
    if (this.router.url.startsWith(this.LOGIN_ROUTE)) {
      this.auth.logOut();
      this.onLogout();
      this.notification.notify(msg);
      return;
    }

    this.auth.logOut();
    this.onLogout();
    this.notification.notify(msg);
    this.router.navigateByUrl(this.LOGIN_ROUTE);
  }
}
