import { inject, Injectable } from '@angular/core';
import { PointEvent, User } from '../user/user-model';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class PointsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  randomPoints() {
    return Math.floor(Math.random() * (20 - 0 + 1));
  }

  /**
   * Obtiene el historial de puntos (ahora desde tabla separada)
   */
  getHistory(userId: string, limit?: number): Observable<PointEvent[]> {
    const actualLimit = !limit || limit === Infinity ? 100 : limit;
    return this.http.get<PointEvent[]>(
      `${this.baseUrl}/${userId}/points/history?limit=${actualLimit}`
    );
  }

  /**
   * El backend maneja los puntos de login automáticamente
   */
  awardLoginPoints(user: User): Observable<User> {
    return of(user);
  }

  /**
   * Agrega puntos al usuario
   */
  addPoints(user: User, amount: number, reason?: string): Observable<User> {
    if (!user.id) return of(user);

    return this.http.post<User>(`${this.baseUrl}/${user.id}/points`, {
      amount,
      reason: reason || 'Puntos agregados'
    });
  }

  /**
   * El backend maneja el historial automáticamente
   */
  addHistory(user: User, event: PointEvent): Observable<User> {
    return of(user);
  }
}
