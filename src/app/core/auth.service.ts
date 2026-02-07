import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '../user/user-model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthServ {
  private readonly http = inject(HttpClient);
  private readonly notification = inject(NotificationService);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  public readonly activeUser = signal<User | undefined>(undefined);
  public readonly isLoggedIn = computed(() => this.activeUser() !== undefined);

  /**
   * Checks if an email already exists in the database.
   */
  existsEmail(email: string): Observable<boolean> {
    return this.http
      .get<{ exists: boolean }>(`${this.baseUrl}/check-email`, {
        params: { email }
      })
      .pipe(
        map(response => response.exists),
        catchError(() => of(false))
      );
  }

  /**
   * Checks if a username already exists in the database.
   */
  existsUsername(username: string): Observable<boolean> {
    return this.http
      .get<{ exists: boolean }>(`${this.baseUrl}/check-username`, {
        params: { username }
      })
      .pipe(
        map(response => response.exists),
        catchError(() => of(false))
      );
  }

  /**
   * Logs in a user and stores the JWT token.
   */
  login(username: string, password: string): Observable<void> {
    return this.http
      .post<{ user: User; token: string; pointsAwarded: number }>(
        `${this.baseUrl}/login`,
        { username, password }
      )
      .pipe(
        tap(({ user, token, pointsAwarded }) => {
          this.activeUser.set(user);
          localStorage.setItem('activeUser', JSON.stringify(user));
          localStorage.setItem('token', token);

          if (pointsAwarded > 0) {
            this.notification.notify(`¡Bienvenido de vuelta! +${pointsAwarded} puntos por tu ingreso diario`);
          }
        }),
        map(() => void 0)
      );
  }

  /**
   * Logs out the current user.
   */
  logOut() {
    this.activeUser.set(undefined);
    localStorage.removeItem('activeUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

  }

  refreshAccessToken(refreshToken: string){
    return this.http.post('api/auth/refresh', { refreshToken });
  }

  /**
   * Restores session from localStorage.
   */
  restoreSession() {
    const data = localStorage.getItem('activeUser');
    const token = localStorage.getItem('token');

    if (!data || !token) return;

    try {
      const user = JSON.parse(data) as User;
      this.activeUser.set(user);
    } catch {
      localStorage.removeItem('activeUser');
      localStorage.removeItem('token');
    }
  }
}
