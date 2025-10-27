import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NamedAPIResourceList } from './pokemon-models';
import { Pokemon } from './pokemon-models';

/**
 * Service that talks to the PokeAPI
 * 
 * Handles all the HTTP calls to get Pokemon data - lists, by name, or by URL
 */
@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly baseURL = "https://pokeapi.co/api/v2";
  private readonly http = inject(HttpClient);

  /**
   * Gets a paginated list of Pokemon resources
   * @param limit How many Pokemon to get (default 20)
   * @param offset Where to start from (default 0)
   */
  getPokemonList(limit: number = 20, offset: number = 0){
    const url = `${this.baseURL}/pokemon?limit=${limit}&offset=${offset}`;
    return this.http.get<NamedAPIResourceList>(url);
  }

  /**
   * Gets full Pokemon details by name
   */
  getPokemonByName(name: string){
    return this.http.get<Pokemon>(`${this.baseURL}/pokemon/${name}`);
  }

  /**
   * Gets full Pokemon details by URL
   */
  getPokemonByURL(url: string){
    return this.http.get<Pokemon>(url);
  }
}