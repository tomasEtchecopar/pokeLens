import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { NamedAPIResourceList } from './pokemon-models';
import { Pokemon } from './pokemon-models';
import { catchError, map } from 'rxjs';

/**
 * Service that talks to the PokeAPI
 * Handles all the HTTP calls to get Pokemon data - lists, by name, or by URL
 * 
 */
@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly baseURL = "https://pokeapi.co/api/v2";
  private readonly http = inject(HttpClient);

/*   /**
   * @param limit How many Pokemon to get (default 20)
   * @param offset Where to start from (default 0)
   * @returns NamedAPIResourceList
   */
  getPokemonList(limit: number = 20, offset: number = 0){
    const url = `${this.baseURL}/pokemon?limit=${limit}&offset=${offset}`;
    return this.http.get<NamedAPIResourceList>(url);
  } */

  /**
   * 
   * @param name of pokemon
   * @returns pokemon
   */
  getPokemonByName(name: string){
    return this.http.get<Pokemon>(`${this.baseURL}/pokemon/${name}`);
  }

  /**
   * 
   * @param id of pokemon
   * @returns Pokemon
   */
  getPokemonByID(id: number){
    return this.http.get<Pokemon>(`${this.baseURL}/pokemon/${id}`);
  }

  /**
   * 
   * @param url of pokeapi endpoint
   * @returns Pokemon
   */
  getPokemonByURL(url: string){
    return this.http.get<Pokemon>(url);
  }

    /**
   * Searches Pokemon by name or id from a large list
   * @param term Search term to filter Pokemon names
   * @param maxResults Maximum number of results to return
   * @returns an Observable of NamedAPIResources
   */
  searchPokemon(term: string, maxResults: number = 20): Observable<NamedAPIResourceList> {
    const termTrimmed = term.trim();
    if (!termTrimmed) {
      return of({ count: 0, next: null, previous: null, results: [] });
    }

    const isNumericSearch = /^\d+$/.test(termTrimmed); //use of regex to check if the term is numeric

    if(isNumericSearch){
      return this.getPokemonByID(parseInt(termTrimmed)).pipe( //passing the string as int and mapping return as a NamedAPIResource
        map(pokemon =>({
          count: 1,
          next: null,
          previous: null,
          results: [{
            name: pokemon.name,
            url: `${this.baseURL}/pokemon/${pokemon.id}/`
          }]
        }))
      );
    } 
    // Get a large list and filter client-side (PokeAPI doesn't have search endpoint)
    return this.http.get<NamedAPIResourceList>(`${this.baseURL}/pokemon?limit=1000`).pipe(
      map(response => {
        const filtered = response.results.filter(pokemon =>
          pokemon.name.toLowerCase().includes(term.toLowerCase())
        );
        
        return {
          count: filtered.length,
          next: null,
          previous: null,
          results: filtered.slice(0, maxResults)
        };
      }),
      catchError(() => of({ count: 0, next: null, previous: null, results: [] }))
    );
  }
}

