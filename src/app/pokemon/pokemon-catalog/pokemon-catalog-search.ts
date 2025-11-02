import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { computed } from '@angular/core';
import { NamedAPIResource } from '../pokemon-models';

@Injectable({
  providedIn: 'root'
})
export class PokemonCatalogSearch {
  /**
   * Pokemon list to search from
   */
  private readonly allPokemon = signal<NamedAPIResource[]>([]);

  readonly searchTerm = signal('');

  /**
   * filtered search results
   */
  readonly results = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if(!term) return this.allPokemon();
    return this.allPokemon().filter(p =>
      p.name.toLowerCase().includes(term)
    );
  });

  setPokemonList(list: NamedAPIResource[]): void{
    this.allPokemon.set(list);
  }

  search(term: string): void{
    this.searchTerm.set(term);
  }
}
