import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '../user/user-model';
import { HttpParams } from '@angular/common/http';
import { catchError, map, of, tap, switchMap } from 'rxjs';
import { PointsService } from './points.service';
import { SupabaseService } from './supabase-service';
import { from } from 'rxjs';

/**
 * AuthServ handles all authentication-related operations.
 * Manages user sessions, login/logout, and credential validation.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthServ {
  private readonly supabase = inject(SupabaseService);
  private readonly points = inject(PointsService);

  // Signal that holds the currently logged-in user (undefined if not logged in)
  public readonly activeUser = signal<User | undefined>(undefined);

  // Computed signal that returns true if there's an active user
  public readonly isLoggedIn = computed(() => this.activeUser() !== undefined);

  /**
   * Checks if an email already exists in the database.
   * Returns true if found, false otherwise (or on error).
   */
  existsEmail(email: string) {
    return from(
      this.supabase.client
      .from('users')
      .select('id')
      .eq('mail', email)
      .single()
    ).pipe(
      map(({data}) => !!data),
      catchError(() => of(false))
    )
  }

  /**
   * Checks if a username already exists in the database.
   * Returns true if found, false otherwise (or on error).
   */
  existsUsername(username: string) {
    return from(
      this.supabase.client
        .from('users')
        .select('id')
        .eq('username', username)
        .single()
    ).pipe(
      map(({ data }) => !!data),
      catchError(() => of(false))
    );
  }

  /**
   * Logs in a user by validating credentials, awarding login points,
   * and storing the session in localStorage.
   * Throws an error if credentials are invalid.
   */
  login(username: string, password: string) {
  return from(
      this.supabase.client
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error || !data) {
          throw new Error('Credenciales inválidas');
        }
        return data as User;
      }),
      switchMap(user => this.points.awardLoginPoints(user)),
      tap(updatedUser => {
        this.activeUser.set(updatedUser);
        localStorage.setItem('activeUser', JSON.stringify(updatedUser));
      }),
      map(() => void 0)
    );
  }

  /**
   * Logs out the current user by clearing the session
   * and removing data from localStorage.
   */
  logOut() {
    this.activeUser.set(undefined);
    localStorage.removeItem('activeUser');
  }

  /**
   * Attempts to restore a previous session from localStorage.
   * If data is invalid or corrupted, it cleans up localStorage.
   */
  restoreSession() {
    const data = localStorage.getItem('activeUser');
    if (!data) return;

    try {
      const user = JSON.parse(data) as User;
      this.activeUser.set(user);
    } catch {
      // If parsing fails, just remove the corrupted data
      localStorage.removeItem('activeUser');
    }
  }
}
