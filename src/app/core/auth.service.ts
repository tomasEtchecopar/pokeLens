import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '../user/user-model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, of, tap, switchMap } from 'rxjs';
import { PointsService } from './points.service';



@Injectable({
  providedIn: 'root'
})
export class AuthServ {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/users';

  private readonly points = inject(PointsService);

  public readonly activeUser = signal<User | undefined>(undefined)
  public readonly isLoggedIn = computed(() => this.activeUser() !== undefined);

  existsEmail(email: string) {
    return this.http
      .get<User[]>(this.baseUrl, { params: { mail: email } })
      .pipe(
        map(arr => arr.length > 0),
        catchError(() => of(false))
      );
  }

  existsUsername(username: string) {
    return this.http
      .get<User[]>(this.baseUrl, { params: { username } })
      .pipe(
        map(arr => arr.length > 0),
        catchError(() => of(false))
      );
  }


  login(username: string, password: string) {
    const params = new HttpParams()
      .set('username', username)
      .set('password', password)
      .set('_limit', 1);

    return this.http.get<User[]>(this.baseUrl, { params }).pipe(
      map(users => users[0] ?? null),
      // 1) validar credenciales
      switchMap(user => {
        if (!user) {
          throw new Error('Credenciales inválidas');
        }
        // 2) otorgar puntos según última fecha de login
        return this.points.awardLoginPoints(user);
      }),
      // 3) actualizar sesión con el usuario ya actualizado (puntos / fecha)
      tap(updatedUser => {
        this.activeUser.set(updatedUser);
        localStorage.setItem('activeUser', JSON.stringify(updatedUser));
      }),
      // para que el componente de login reciba void y solo le importe éxito / error
      map(() => void 0)
    );
  }

  logOut() {
    this.activeUser.set(undefined);
    localStorage.removeItem('activeUser');

  }
  restoreSession() {
    const data = localStorage.getItem('activeUser');
    if (!data) return;
    try {
      const user = JSON.parse(data) as User;
      this.activeUser.set(user);
    } catch {
      localStorage.removeItem('activeUser');
    }
  }


}