import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, switchMap } from 'rxjs';
import { NamedAPIResourceList } from './models/pokemon-models';
import { Pokemon, PokemonSpecies, Generation } from './models/pokemon-models';
import { Observable } from 'rxjs';
import { map } from 'rxjs';


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
  private getPokemonList(limit: number = 20, offset: number = 0) {
    const url = `${this.baseURL}/pokemon?limit=${limit}&offset=${offset}`;
    return this.http.get<NamedAPIResourceList>(url);
  }

  /**
   * Function to fetch the resource for all pokemon
   * @returns NamedApiResource[]
   */
  private getAllPokemonResource() {
    return this.http.get<NamedAPIResourceList>(`${this.baseURL}/pokemon?limit=9999`)
      .pipe(map(res => res.results))
  }
  /**
   * 
   * @param name of pokemon
   * @returns pokemon
   */
  private getPokemonByName(name: string) {
    return this.http.get<Pokemon>(`${this.baseURL}/pokemon/${name}`);
  }
  /**
  * Get Pokemon Species data
  * @param url Species URL
  * @returns PokemonSpecies
  */
  private getPokemonSpecies(url: string) {
    return this.http.get<PokemonSpecies>(url);
  }

  /**
   * Get Generation data
   * @param url Generation URL
   * @returns Generation
   */
  private getGeneration(url: string) {
    return this.http.get<Generation>(url);
  }
  getTypes() {
    return this.http.get<{ results: { name: string }[] }>(`${this.baseURL}/type`).pipe(
      map(res => res.results
        .map(t => t.name)
      )
    )
  }

  getGenerations() {
    return this.http.get<{ results: { name: string }[] }>(`${this.baseURL}/generation`).pipe(
      map(res => res.results.map(g => g.name))
    )
  }

  getRegions() {
    return this.http.get<{ results: { name: string }[] }>(`${this.baseURL}/region`).pipe(
      map(res => res.results.map(r => r.name))
    )
  }


  /**
   * Function to get all Pokemon as objects
   * @returns Pokemon[]
   */
  getAllPokemon() {
    return this.getAllPokemonResource().pipe(
      switchMap(resourceList => forkJoin(
        resourceList.map(r => this.getPokemon(r.name))
      ))
    )
  }


  /**
   * Funcion to get a Pokemon from PokeAPI
   * @param nameOrId of said pokemon
   * @returns Pokemon
   */
  getPokemon(nameOrId: string): Observable<Pokemon> {
    console.log("getting pokemon: " + nameOrId);
    return this.getPokemonByName(nameOrId).pipe(
      switchMap(pokemon =>
        this.getPokemonSpecies(pokemon.species.url).pipe(
          switchMap(species =>
            this.getGeneration(species.generation.url).pipe(
              map(generation => ({
                ...pokemon,
                generation: species.generation.name,
                region: generation.main_region.name
              }))
            )
          )
        )
      )
    );
  }

}

