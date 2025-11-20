import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PointEvent, User } from '../user/user-model';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../enviroments/enviroment';

/**
 * PointsService manages the user points system.
 * Handles awarding points for various actions, tracking history, and daily login bonuses.
 */
@Injectable({
  providedIn: 'root'
})
export class PointsService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl =`${environment.apiUrl}/users`

  /**
   * Generates a random bonus between 0-20 points.
   * Used during user registration.
   */
  randomPoints() {
    return Math.floor(Math.random() * (20 - 0 + 1))
  }

  /**
   * Retrieves the user's points history (last N events).
   */
  getHistory(userId: string, limit = 10): Observable<PointEvent[]> {
    return this.http.get<User>(`${this.baseUrl}/${userId}`).pipe(
      map(user => (user.pointsHistory ?? []).slice(-limit))
    );
  }

  /**
   * Awards +10 points for daily login if user hasn't logged in today yet.
   * Updates lastLoginDate regardless. Shows an alert when points are awarded.
   * Returns the updated user (with or without new points).
   */
  awardLoginPoints(user: User): Observable<User> {
    if (!user.id) return of(user);

    const today = new Date();
    const last = user.lastLoginDate ? new Date(user.lastLoginDate) : null;

    const isSameDay =
      last &&
      last.getFullYear() === today.getFullYear() &&
      last.getMonth() === today.getMonth() &&
      last.getDate() === today.getDate();

    // Already logged in today - just update timestamp, no points
    if (isSameDay) {
      const updated: User = {
        ...user,
        lastLoginDate: today.toISOString()
      };
      return this.http.put<User>(`${this.baseUrl}/${user.id}`, updated);
    }

    // New day - award daily login bonus
    const event: PointEvent = {
      amount: 10,
      reason: 'Inicio de sesión diario',
      date: today.toISOString()
    };

    const updatedWithPoints: User = {
      ...user,
      points: (user.points ?? 0) + 10,
      lastLoginDate: today.toISOString(),
      pointsHistory: [...(user.pointsHistory ?? []), event]
    };

    return this.http.put<User>(`${this.baseUrl}/${user.id}`, updatedWithPoints).pipe(
      tap(() => alert('Se le asignaron +10 Puntos por su ingreso diario!'))
    );
  }

  /**
   * Generic method to add points for any action.
   * @param reason - If provided, shows an alert with this message
   * @param reason2 - If provided (and reason is not), logs silently to console
   *
   * Usage: Pass reason for user-facing alerts, reason2 for silent logging.
   */
  addPoints(user: User, amount: number, reason?: string, reason2?: string): Observable<User> {
    if (!user.id) return of(user);

    const updated: User = {
      ...user,
      points: (user.points ?? 0) + amount,
      pointsHistory: user.pointsHistory ?? []
    };

    if (reason) {
      return this.alertAddPoints(updated, user.id, reason);
    } else {
      return this.notAlertAddPoints(updated, user.id, reason2 ?? '');
    }
  }

  // Updates user and shows alert with the reason
  alertAddPoints(user: User, id: string, reason: string): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, user).pipe(
      tap(() => {
        alert(reason);
      })
    );
  }

  // Updates user and logs silently to console
  notAlertAddPoints(user: User, id: string, reason2: string): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, user).pipe(
      tap((updatedUser) => {
        console.log(`Puntos actualizados (${reason2}) — total: ${updatedUser.points}`);
      })
    );
  }

  /**
   * Adds a custom event to the user's points history.
   */
  addHistory(user: User, event: PointEvent): Observable<User> {
    if (!user.id) return of(user);

    const updatedUser: User = {
      ...user,
      pointsHistory: [...(user.pointsHistory ?? []), event]
    };

    return this.http.put<User>(`${this.baseUrl}/${user.id}`, updatedUser);
  }
}

// Example usage:
/*
const user = this.auth.activeUser();

if (!user) return;

this.points.addPoints(
  user,
  10,
  '+10 puntos por agregar un Pokémon a tu equipo'
).subscribe(updatedUser => {
  // Update active user in auth service
  this.auth.activeUser.set(updatedUser);
  localStorage.setItem('activeUser', JSON.stringify(updatedUser));
});
*/
