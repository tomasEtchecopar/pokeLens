import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pokemon } from './models/pokemon-models';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class PokemonListService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pokemon`;

  // Signal con todos los pokemon cargados
  private readonly _allPokemon = signal<Pokemon[]>([]);

  // Computed signals públicos
  readonly allPokemon = computed(() => this._allPokemon());
  readonly allPokemonResource = computed(() =>
    this._allPokemon().map(p => ({ name: p.name, url: '' }))
  );

  /**
   * Carga todos los pokemon desde el backend
   */
loadAllPokemon() {
  return this.http.get<Pokemon[]>(this.baseUrl).subscribe({
    next: (pokemon) => {
      console.log(`${pokemon.length} loaded pokemons`);
      this._allPokemon.set(pokemon);
    },
    error: (err) => console.error('Error:', err)
  })
}
  /**
   * Obtiene un pokemon por ID
   */
  getPokemonById(id: number) {
    return this.http.get<Pokemon>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene un pokemon por nombre
   */
  getPokemonByName(name: string) {
    return this.http.get<Pokemon>(`${this.baseUrl}/name/${name}`);
  }

  /**
   * Busca pokemon con filtros
   */
  searchPokemon(filters: {
    name?: string;
    type?: string;
    generation?: string;
    region?: string;
    minHeight?: number;
    maxHeight?: number;
    minWeight?: number;
    maxWeight?: number;
  }) {
    return this.http.get<Pokemon[]>(this.baseUrl, { params: filters as any });
  }

  /**
   * Obtiene tipos únicos
   */
  getTypes() {
    return this.http.get<string[]>(`${this.baseUrl}/types`);
  }

  /**
   * Obtiene generaciones únicas
   */
  getGenerations() {
    return this.http.get<string[]>(`${this.baseUrl}/generations`);
  }

  /**
   * Obtiene regiones únicas
   */
  getRegions() {
    return this.http.get<string[]>(`${this.baseUrl}/regions`);
  }
    hashToPokemonId(username: string): number {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = ((hash << 5) - hash) + username.charCodeAt(i);
      hash |= 0;
    }
    return (Math.abs(hash) % 1025) + 1;
  }

  pokemonArtworkUrl(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }
}
