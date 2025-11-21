import { inject, Injectable } from '@angular/core';
import { PointEvent, User } from '../user/user-model';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../enviroments/enviroment';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PointsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  randomPoints() {
    return Math.floor(Math.random() * (20 - 0 + 1));
  }

  getHistory(userId: string, limit = 10): Observable<PointEvent[]> {
    return this.http.get<User>(`${this.baseUrl}/${userId}`).pipe(
      map(user => (user.points_history ?? []).slice(-limit))
    );
  }

  // El backend ahora maneja los puntos de login automáticamente
  awardLoginPoints(user: User): Observable<User> {
    return of(user); // Ya no es necesario, el backend lo hace en login
  }

  addPoints(user: User, amount: number, reason?: string, reason2?: string): Observable<User> {
    if (!user.id) return of(user);

    return this.http.post<User>(`${this.baseUrl}/${user.id}/points`, {
      amount,
      reason: reason || reason2 || 'Puntos agregados'
    }).pipe(
      tap(() => {
        if (reason) {
          alert(reason);
        } else if (reason2) {
          console.log(`Puntos actualizados (${reason2})`);
        }
      })
    );
  }

  addHistory(user: User, event: PointEvent): Observable<User> {
    // Ahora el backend maneja el historial automáticamente al agregar puntos
    return of(user);
  }
}
