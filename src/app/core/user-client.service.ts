import { Observable } from 'rxjs';
import { User } from '../user/user-model';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../enviroments/enviroment';
import { pokemonVault } from '../pages/pokemon-collections/collection-model';

@Injectable({
  providedIn: 'root'
})
export class UserClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  addUser(user: User): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(
      `${environment.apiUrl}/auth/register`,
      user
    );
  }

  deleteUser(id: string | number){
    return this.http.delete<User>(`${this.baseUrl}/${id}`);
  }

  updateUser(user: User, id: string | number): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, user);
  }

  addPokemonToVault( userId: string, pokemon: pokemonVault, collectionNumber: number): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/${userId}/pokemon`, { pokemon, collectionNumber });
  }
}
