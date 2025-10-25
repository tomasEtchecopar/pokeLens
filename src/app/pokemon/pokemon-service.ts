import { Injectable } from '@angular/core';
import { PokemonClient } from 'pokenode-ts';
import { from, Observable, of } from 'rxjs';
import {  catchError } from 'rxjs/operators';
import { NamedAPIResourceList } from 'pokenode-ts';

@Injectable({
  providedIn: 'root'
})

/**
 * Service responsible for retrieving Pokémon data from the PokeAPI
 * through the pokenode-ts client library.
 * It centralizes all data requests and provides typed Observables
 * for easy integration with Angular components.
 *
 * `NamedAPIResourceList` is the standard paginated response from the PokeAPI.
 * It contains:
 *  - `count`: total number of available items in the API
 *  - `next` / `previous`: pagination URLs
 *  - `results`: an array of lightweight resources `{ name, url }`
 *    used to request full Pokémon details separately
 */
@Injectable({ providedIn: 'root' })
export class PokemonService {

  /** Instance of the PokeAPI client used to perform requests. */
  private readonly client = new PokemonClient();

  /**
   * Retrieves a paginated list of Pokémon resources.
   * Only basic identifiers (name and URL) are returned.
   * To get complete data for a specific Pokémon, call `getPokemon()`.
   *
   * @param limit Number of items to fetch.
   * @param offset Starting position in the list.
   * @returns Observable that emits a `NamedAPIResourceList` with `count`, `next`, `previous` and `results`.
   */
  getPokemonList(limit = 20, offset = 0): Promise<NamedAPIResourceList> {
    return this.client.listPokemons(offset, limit)
    .catch((err) => console.log("Could not access pokemon list: " + err));
  }

  /**
   * Retrieves full details for a Pokémon by name or ID.
   *
   * @param nameOrId Pokémon identifier (e.g. "pikachu", 25).
   * @returns Observable that emits a `Pokemon` on success or `null` on failure.
   */
  getPokemon(nameOrId: string | number): Observable<Pokemon | null> {
    return from(this.client.getPokemonByName(String(nameOrId))).pipe(
      catchError(err => {
        console.error('Error fetching Pokémon details:', err);
        return of(null);
      })
    );
  }
}