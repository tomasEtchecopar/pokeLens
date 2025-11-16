import { Observable, switchMap } from 'rxjs';
import { User } from '../user/user-model';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { pokemonVault } from '../pages/pokemon-collections/collection-model';



@Injectable({
  providedIn: 'root'
})
export class UserClient {


  private readonly http = inject(HttpClient);
  private readonly baseUrl = "http://localhost:3000/users"

  getUserById(id: string): Observable<User>{
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  addUser(user: User): Observable<User>{
    return this.http.post<User>(this.baseUrl, user);
  }

  updateUser(user: User, id: string | number): Observable<User>{
    return this.http.put<User>(`${this.baseUrl}/${id}`, user)
  }

  addPokemonToVault(userId: string, nuevoPokemon: pokemonVault): Observable<User> {
  return this.getUserById(userId).pipe(
    switchMap(usuario => {
      const vault = usuario.pokemonVault ?? [];
      const nextId = vault.length ? Math.max(...vault.map(p => p.arrayId)) + 1 : 0;
      const updatedVault = [...vault, { ...nuevoPokemon, arrayId: nextId }];
      return this.http.patch<User>(`${this.baseUrl}/${userId}`, { pokemonVault: updatedVault });
    })
  );
}


}
