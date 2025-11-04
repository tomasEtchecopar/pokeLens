import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { computed } from '@angular/core';
import { Pokemon } from '../../pokemon-models';
import { NamedAPIResource } from '../../pokemon-models';

@Injectable({
  providedIn: 'root'
})
export class PokemonCatalogSearch {
  /**
   * Pokemon list to search from
   */
  private readonly allPokemon = signal<Pokemon[]>([]);

  readonly searchTerm = signal('');

  /**
   * filtered search results
   */
  readonly results = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if(!term) return this.allPokemon();

    const filteredResults = this.allPokemon().filter(p =>
      p.name.toLowerCase().includes(term)
    );
    return filteredResults; 
  });

  readonly hasResults = computed(() => {
    return this.results().length>0;
  })

  setPokemonList(list: Pokemon[]): void{
    this.allPokemon.set(list ?? []);
  }

  search(term: string): void{
    this.searchTerm.set(term);
  }
}
