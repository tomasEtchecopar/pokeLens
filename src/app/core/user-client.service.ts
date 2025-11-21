import { SupabaseService } from './supabase-service';
import { Observable, switchMap } from 'rxjs';
import { User } from '../user/user-model';
import { inject, Injectable } from '@angular/core';
import { from } from 'rxjs';
import { pokemon_vault } from '../pages/pokemon-collections/collection-model';
import { map } from 'rxjs';

/**
 * UserClient handles CRUD operations for users and manages pokemon collections.
 */
@Injectable({
  providedIn: 'root'
})
export class UserClient {
  private readonly supabase = inject(SupabaseService);

  getUserById(id: string): Observable<User> {
    return from(
      this.supabase.client
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as User;
      })
    );
  }

  addUser(user: User): Observable<User> {
    const { id, ...userWithoutId } = user; //removing id, supabase autogenerates it

    return from(
      this.supabase.client
        .from('users')
        .insert(userWithoutId)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as User;
      })
    );
  }

 updateUser(user: User, id: string | number): Observable<User> {
    return from(
      this.supabase.client
        .from('users')
        .update(user)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as User;
      })
    );
  }

  deleteUser(id: string) {
    return from(
      this.supabase.client
      .from('users')
      .delete()
      .eq('id', id)
      .select()
      .single()
    )
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
 addPokemonToVault( userId: string, nuevoPokemon: pokemon_vault, collectionNumber: number): Observable<User> {
    return this.getUserById(userId).pipe(
      switchMap(usuario => {
        const vaults: pokemon_vault[][] = usuario.pokemon_vault ?? [];
        const index = Math.max(collectionNumber - 1, 0);

        // Create empty collections if needed
        while (vaults.length <= index) {
          vaults.push([]);
        }

        const targetCollection = vaults[index];

        // Calculate next arrayId
        const nextId = targetCollection.length
          ? Math.max(...targetCollection.map(p => p.arrayId ?? 0)) + 1
          : 0;

        const updatedCollection = [
          ...targetCollection,
          { ...nuevoPokemon, arrayId: nextId }
        ];

        const updatedVaults = vaults.map((col, i) =>
          i === index ? updatedCollection : col
        );

        // Update only pokemon_vault field
        return from(
          this.supabase.client
            .from('users')
            .update({ pokemon_vault: updatedVaults })
            .eq('id', userId)
            .select()
            .single()
        ).pipe(
          map(({ data, error }) => {
            if (error) throw error;
            return data as User;
          })
        );
      })
    );
  }
}
