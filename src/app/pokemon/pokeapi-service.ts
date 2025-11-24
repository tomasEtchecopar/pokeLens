import { Injectable, inject } from '@angular/core';
import { EvolutionChainLink } from './models/pokemon-models';
import { HttpClient } from '@angular/common/http';
import { NamedAPIResourceList, EvolutionChain } from './models/pokemon-models';
import { Pokemon, PokemonSpecies, Generation } from './models/pokemon-models';
import { Observable, forkJoin, from, of, switchMap, mergeMap, catchError, toArray, filter, map } from 'rxjs';

/**
 * Service that calls the PokeAPI
 * Handles all the HTTP calls to get Pokemon data
 */
@Injectable({ providedIn: 'root' })
export class PokeApiService {
  private readonly baseURL = "https://pokeapi.co/api/v2";
  private readonly http = inject(HttpClient);


  /**
   * Function to fetch the resource for all pokemon
   * @returns NamedApiResource[]
   */
  getAllPokemonResource() {
    return this.http.get<NamedAPIResourceList>(`${this.baseURL}/pokemon?limit=9999`)
      .pipe(map(res => res.results))
  }

  /**
   * @param name of pokemon
   * @returns pokemon
   */
  private getPokemonByName(name: string) {
    return this.http.get<Pokemon>(`${this.baseURL}/pokemon/${name}`);
  }


  /**
   * Function to get all Pokemon as objects
   * @returns Pokemon[]
   */
  getAllPokemon(limit = 2000) {
    return this.http
      .get<NamedAPIResourceList>(`${this.baseURL}/pokemon?limit=${limit}`)
      .pipe(
        switchMap(res =>
          from(res.results).pipe(
            mergeMap(
              r =>
                this.getPokemon(r.name).pipe(
                  catchError(err => {
                    console.warn('Error cargando', r.name, err);
                    return of(null);
                  })
                ),
              300
            ),
            filter((p): p is Pokemon => p !== null),
            toArray()
          )
        )
      );
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
            forkJoin({
              generation: this.getGeneration(species.generation.url),
              evolutionChain: this.http.get<any>(species.evolution_chain.url)
            }).pipe(
              map(({ generation, evolutionChain }) => ({
                ...pokemon,
                generation: species.generation.name,
                region: generation.main_region.name,
                evolution_line: this.extractEvolutionNames(evolutionChain)
              }))
            )
          )
        )
      )
    );
  }

  /**
  * @param url Species URL
  * @returns PokemonSpecies
  */
  private getPokemonSpecies(url: string) {
    return this.http.get<PokemonSpecies>(url);
  }

  /**
   * @param url Generation URL
   * @returns Generation
   */
  private getGeneration(url: string) {
    return this.http.get<Generation>(url);
  }

  /**
   * Return all available types on the pokeapi as strings
   * @return Object: { results: string[] }
   */
  getAvailableTypes() {
    return this.http.get<{ results: { name: string }[] }>(`${this.baseURL}/type`).pipe(
      map(res => res.results
        .map(t => t.name)
      )
    )
  }

   /**
   * Return all available generations on the pokeapi as strings
   * @return Object: { results: string[] }
   */
  getAvailableGenerations() {
    return this.http.get<{ results: { name: string }[] }>(`${this.baseURL}/generation`).pipe(
      map(res => res.results.map(g => g.name))
    )
  }

    /**
   * Return all available regions on the pokeapi as strings
   * @return Object: { results: string[] }
   */
  getAvailableRegions() {
    return this.http.get<{ results: { name: string }[] }>(`${this.baseURL}/region`).pipe(
      map(res => res.results.map(r => r.name))
    )
  }


  hashToPokemonId(text: string, max = 1025): number {
    let h = 0;
    for (let i = 0; i < text.length; i++) {
      h = ((h << 5) - h) + text.charCodeAt(i) | 0;
    }
    h = Math.abs(h);
    return (h % max) + 1; // 1..max
  }

  /**
   * Gets an artwork based on its ID
   */
  pokemonArtworkUrl(id: number | string | undefined): string {
    if (!id) return '/assets/images/default.png';

    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }


  randomPokemonId(max = 1025) {
    return Math.floor(Math.random() * max) + 1;
  }

  //Calcular el poder de una equipo
  //pokeApi devuelve un array, con reduce ya soluciona
  calcularPoder(stats: any[]): number {
    return stats.reduce((total, s) => total + s.base_stat, 0);
  }


  private extractEvolutionNames(chain: EvolutionChain) {
    const names: string[] = [];

    function iterateEvolutionNodes(node: EvolutionChainLink) {
      if (!node || !node.species || !node.species.name) {
        return;
      }
      names.push(node.species.name);
      if (node.evolves_to) {
        node.evolves_to.forEach(evolution => {
          iterateEvolutionNodes(evolution);
        })
      }
    }

    iterateEvolutionNodes(chain.chain);
    return names;

  }

}

