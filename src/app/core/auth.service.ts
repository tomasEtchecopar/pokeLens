import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '../user/user-model';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthServ {
  private readonly http = inject(HttpClient);
  private readonly notification = inject(NotificationService);

  // environment.apiUrl ya trae /api (en tu caso), así que armamos /auth directo
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  public readonly activeUser = signal<User | undefined>(undefined);
  public readonly isLoggedIn = computed(() => this.activeUser() !== undefined);

  existsEmail(email: string) {
    const e = (email ?? '').trim().toLowerCase();
    if (!e) return of(false);

    return this.http
      .get<{ available: boolean }>(`${this.baseUrl}/check-email`, {
        params: { email: e }
      })
      .pipe(map(r => !r.available));
  }

  existsUsername(username: string) {
    const u = (username ?? '').trim();
    if (!u) return of(false);

    return this.http
      .get<{ available: boolean }>(`${this.baseUrl}/check-username`, { params: { username: u } })
      .pipe(map(r => !r.available));
  }

  login(username: string, password: string): Observable<void> {
    return this.http
      .post<{ user: User; accessToken?: string; refreshToken?: string; pointsAwarded: number }>(
        `${this.baseUrl}/login`,
        { username, password }
      )
      .pipe(
        tap(({ user, accessToken, refreshToken, pointsAwarded }) => {
          this.notification.clearAll();
          this.activeUser.set(user);
          localStorage.setItem('activeUser', JSON.stringify(user));
          if (accessToken) localStorage.setItem('accessToken', accessToken);
          if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

          if (pointsAwarded > 0) {
            this.notification.notify(
              `Bienvenido de vuelta. +${pointsAwarded} puntos por tu ingreso diario`
            );
          }
        }),

        map(() => void 0)
      );
  }

  logOut() {
    this.activeUser.set(undefined);
    localStorage.removeItem('activeUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.notification.clearAll();

  }

  refreshAccessToken(refreshToken: string){
    return this.http.post(`${this.baseUrl}/refresh`, { refreshToken });
  }

  /**
   * Restores session from localStorage.
   */
  restoreSession() {
    const data = localStorage.getItem('activeUser');
    const token = localStorage.getItem('accessToken');

    if (!data || !token) return;

    try {
      const user = JSON.parse(data) as User;
      this.activeUser.set(user);
    } catch {
      localStorage.removeItem('activeUser');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
}
