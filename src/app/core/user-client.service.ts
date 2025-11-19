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

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.baseUrl, user);
  }

  updateUser(user: User, id: string | number): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, user)
  }

addPokemonToVault(
    userId: string,
    nuevoPokemon: pokemonVault,
    collectionNumber: number
  ): Observable<User> {
    return this.getUserById(userId).pipe(
      switchMap(usuario => {
        // aseguramos array externo
        const vaults: pokemonVault[][] = usuario.pokemonVault ?? [];

        // equipo 1 -> índice 0, equipo 2 -> índice 1, etc.
        const index = Math.max(collectionNumber - 1, 0);

        // si no existe esa equipo, creamos las que falten vacías
        while (vaults.length <= index) {
          vaults.push([]);
        }

        const targetCollection = vaults[index];

        // calcular próximo arrayId dentro DE ESA equipo
        const nextId = targetCollection.length
          ? Math.max(...targetCollection.map(p => p.arrayId ?? 0)) + 1
          : 0;

        const updatedCollection = [
          ...targetCollection,
          { ...nuevoPokemon, arrayId: nextId }
        ];

        // reconstruimos el array de equipos
        const updatedVaults = vaults.map((col, i) =>
          i === index ? updatedCollection : col
        );

        // PATCH solo del campo pokemonVault
        return this.http.patch<User>(`${this.baseUrl}/${userId}`, {
          pokemonVault: updatedVaults
        });
      })
    );
  }



}
