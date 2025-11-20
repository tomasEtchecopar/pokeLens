import { Observable, switchMap } from 'rxjs';
import { User } from '../user/user-model';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { pokemonVault } from '../pages/pokemon-collections/collection-model';

/**
 * UserClient handles CRUD operations for users and manages pokemon collections.
 * Wraps HTTP calls to the users endpoint.
 */
@Injectable({
  providedIn: 'root'
})
export class UserClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = "http://localhost:3000/users"

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  user(user: User): Observable<User> {
    return this.http.post<User>(this.baseUrl, user);
  }

  updateUser(user: User, id: string | number): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, user);
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }


  /**
   * Adds a pokemon to a specific collection/team in the user's vault.
   * Creates missing collections if needed and auto-assigns arrayIds.
   *
   * @param collectionNumber - 1-indexed (1 = first team, 2 = second team, etc.)
   *
   * How it works:
   * - Fetches current user data
   * - Ensures the target collection exists (creates empty ones if needed)
   * - Assigns next available arrayId within that specific collection
   * - Patches only the pokemonVault field
   */
  addPokemonToVault(
    userId: string,
    nuevoPokemon: pokemonVault,
    collectionNumber: number
  ): Observable<User> {
    return this.getUserById(userId).pipe(
      switchMap(usuario => {
        const vaults: pokemonVault[][] = usuario.pokemonVault ?? [];

        // Convert 1-indexed collectionNumber to 0-indexed array position
        const index = Math.max(collectionNumber - 1, 0);

        // Create empty collections up to the target index if needed
        while (vaults.length <= index) {
          vaults.push([]);
        }

        const targetCollection = vaults[index];

        // Calculate next arrayId within THIS specific collection
        const nextId = targetCollection.length
          ? Math.max(...targetCollection.map(p => p.arrayId ?? 0)) + 1
          : 0;

        const updatedCollection = [
          ...targetCollection,
          { ...nuevoPokemon, arrayId: nextId }
        ];

        // Rebuild the vaults array with the updated collection
        const updatedVaults = vaults.map((col, i) =>
          i === index ? updatedCollection : col
        );

        // PATCH only the pokemonVault field to avoid overwriting other user data
        return this.http.patch<User>(`${this.baseUrl}/${userId}`, {
          pokemonVault: updatedVaults
        });
      })
    );
  }
}
