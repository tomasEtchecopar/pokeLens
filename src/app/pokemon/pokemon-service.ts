import { Injectable } from '@angular/core';
import { PokemonClient } from 'pokenode-ts';
import { from, Observable, of } from 'rxjs';
import { shareReplay, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

/**
 * Service responsible for retrieving Pokémon data from the PokeAPI
 * using the pokenode-ts client library.
 * It centralizes all HTTP requests to the API and caches responses
 * in memory to avoid unnecessary repeated network calls and improve performance.
 */
export class PokemonService {

  private readonly client = new PokemonClient(); //Instance of the PokeAPI client used to perform HTTP requests.


  /**
   * In-memory cache used to store Observables from previous requests.
   * Keys describe the type of query performed.
   * 
   * Example of stored keys:
   * - `list:20:0` → Pokémon list with limit=20 and offset=0
   * - `poke:pikachu` → Detailed info for "pikachu"
   */
  private cache = new Map<string, Observable<any>>();

  /**
   * Requests a paginated list of Pokémon.
   * If the same request has already been made before, the cached result is returned.
   *
   * @param limit Number of Pokémon to fetch per page. Default is 20.
   * @param offset Pagination offset. Default is 0.
   * @returns Observable with a paginated response:
   *   `{ results: PokemonListItem[], count: number }`
   */
  getPokemonList(limit = 20, offset = 0): Observable<any> {
    const key = `list:${limit}:${offset}`;

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const obs$ = from(this.client.listPokemons(offset, limit)).pipe(
      shareReplay(1),
      catchError(err => {
        console.error('Error fetching Pokémon list:', err);
        return of({ results: [], count: 0 });
      })
    );

    this.cache.set(key, obs$);
    return obs$;
  }

  /**
   * Requests detailed information for a Pokémon by name or ID.
   * Uses cache to prevent duplicate requests for the same Pokémon.
   *
   * @param nameOrId Pokémon name or numeric ID.
   *   Examples: `"bulbasaur"`, `"25"`, `25`
   * @returns Observable with the Pokémon details.
   *   Returns `null` on failure.
   */
  getPokemon(nameOrId: string | number): Observable<any> {
    const key = `poke:${nameOrId}`;

    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    const obs$ = from(this.client.getPokemonByName(String(nameOrId))).pipe(
      shareReplay(1),
      catchError(err => {
        console.error('Error fetching Pokémon details:', err);
        return of(null);
      })
    );
      this.cache.set(key, obs$);
    return obs$;
  }
}
