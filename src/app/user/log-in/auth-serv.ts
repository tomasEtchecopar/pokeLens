import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '../user-model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/internal/operators/map';
import { tap } from 'rxjs/internal/operators/tap';

@Injectable({
  providedIn: 'root'
})
export class AuthServ {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/users';

  public readonly activeUser = signal<User | undefined>(undefined)
  public readonly isLoggedIn = computed(() => this.activeUser() !== undefined);


  login(username: string, password: string) {
    const params = new HttpParams()
      .set('username', username)
      .set('password', password)
      .set('_limit', 1);

    return this.http.get<User[]>(this.baseUrl, { params }).pipe(
      map(users => users[0] ?? null),
      tap(user => {
        if (!user) throw new Error('Credenciales inválidas');
        this.activeUser.set(user);
      }),
      map(() => void 0)
    );
  }

  logOut() {
    this.activeUser.set(undefined);
  }



}