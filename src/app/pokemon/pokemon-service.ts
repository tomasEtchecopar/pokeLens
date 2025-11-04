import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of, switchMap } from 'rxjs';
import { NamedAPIResourceList} from './pokemon-models';
import { Pokemon } from './pokemon-models';
import { catchError, map } from 'rxjs';

/**
 * Service that talks to the PokeAPI
 * Handles all the HTTP calls to get Pokemon data - lists, by name, or by URL
 */
@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly baseURL = "https://pokeapi.co/api/v2";
  private readonly http = inject(HttpClient);

  /**
   * @param limit How many Pokemon to get (default 20)
   * @param offset Where to start from (default 0)
   * @returns NamedAPIResourceList
   */
  getPokemonList(limit: number = 20, offset: number = 0){
    const url = `${this.baseURL}/pokemon?limit=${limit}&offset=${offset}`;
    return this.http.get<NamedAPIResourceList>(url);
  }
  
  /**
   * Function to fetch the resource for all pokemon
   * @returns NamedApiResource[]
   */
  getAllPokemonResource(){
    return this.http.get<NamedAPIResourceList>(`${this.baseURL}/pokemon?limit=9999`)
    .pipe(map(res => res.results))
  }

  /**
   * Function to get all Pokemon as objects
   * @returns Pokemon[]
   */
  getAllPokemon(){
    return this.getAllPokemonResource().pipe(
      switchMap(resourceList => forkJoin(
        resourceList.map(r => this.getPokemonByName(r.name))
      ))
    )
  }

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


}

