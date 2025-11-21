import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PointEvent, User } from '../user/user-model';
import { from, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../enviroments/enviroment';
import { SupabaseService } from './supabase-service';

/**
 * PointsService manages the user points system.
 * Handles awarding points for various actions, tracking history, and daily login bonuses.
 */
@Injectable({
  providedIn: 'root'
})
export class PointsService {
  private readonly supabase = inject(SupabaseService);


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
    return from(
      this.supabase.client
      .from('users')
      .select('points_history')
      .eq('id', userId)
      .single()
    ).pipe(
      map(({data}) =>{
        const history = (data?.points_history as PointEvent[]) ?? [];
        return history.slice(-limit);
      })
    )
  }

  /**
   * Awards +10 points for daily login if user hasn't logged in today yet.
   * Updates last_login_date regardless. Shows an alert when points are awarded.
   * Returns the updated user (with or without new points).
   */
  awardLoginPoints(user: User): Observable<User> {
    if (!user.id) return of(user);

    const today = new Date();
    const last = user.last_login_date ? new Date(user.last_login_date) : null;

    const isSameDay =
      last &&
      last.getFullYear() === today.getFullYear() &&
      last.getMonth() === today.getMonth() &&
      last.getDate() === today.getDate();

    // Just update last_login_date, no points
    if (isSameDay) {
      const updated: Partial<User> = {
        last_login_date: today.toISOString()
      };

      return from(
        this.supabase.client
          .from('users')
          .update(updated)
          .eq('id', user.id)
          .select()
          .single()
      ).pipe(
        map(({ data }) => data as User)
      );
    }

    // Award daily login bonus
    const event: PointEvent = {
      amount: 10,
      reason: 'Inicio de sesión diario',
      date: today.toISOString()
    };

    const updatedWithPoints: Partial<User> = {
      points: (user.points ?? 0) + 10,
      last_login_date: today.toISOString(),
      points_history: [...(user.points_history ?? []), event]
    };

    return from(
      this.supabase.client
        .from('users')
        .update(updatedWithPoints)
        .eq('id', user.id)
        .select()
        .single()
    ).pipe(
      map(({ data }) => data as User),
      tap(() => alert('Se le asignaron +10 Puntos por su ingreso diario!'))
    );
  }

  addPoints(user: User, amount: number, reason?: string, reason2?: string): Observable<User> {
    if (!user.id) return of(user);

    const updated: Partial<User> = {
      points: (user.points ?? 0) + amount,
      points_history: user.points_history ?? []
    };

    if (reason) {
      return this.alertAddPoints(updated, user.id, reason);
    } else {
      return this.notAlertAddPoints(updated, user.id, reason2 ?? '');
    }
  }

  private alertAddPoints(user: Partial<User>, id: string, reason: string): Observable<User> {
    return from(
      this.supabase.client
        .from('users')
        .update(user)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(({ data }) => data as User),
      tap(() => alert(reason))
    );
  }

  private notAlertAddPoints(user: Partial<User>, id: string, reason2: string): Observable<User> {
    return from(
      this.supabase.client
        .from('users')
        .update(user)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(({ data }) => data as User),
      tap((updatedUser) => {
        console.log(`Puntos actualizados (${reason2}) — total: ${updatedUser.points}`);
      })
    );
  }

  addHistory(user: User, event: PointEvent): Observable<User> {
    if (!user.id) return of(user);

    const updatedHistory = [...(user.points_history ?? []), event];

    return from(
      this.supabase.client
        .from('users')
        .update({ points_history: updatedHistory })
        .eq('id', user.id)
        .select()
        .single()
    ).pipe(
      map(({ data }) => data as User)
    );
  }
}


