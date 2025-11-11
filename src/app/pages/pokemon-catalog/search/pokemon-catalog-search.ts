import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { computed } from '@angular/core';
import { Pokemon } from '../../../pokemon/models/pokemon-models';

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
    console.log("setting search service: ", this.allPokemon() as Pokemon[]);
    const term = this.searchTerm().trim().toLowerCase();
    if(!term) return this.allPokemon();

    console.log(`searching '${term}'`)
    const filteredResults = this.allPokemon().filter(p =>
      p.name.toLowerCase().includes(term)
    );
    console.log("search results: ", filteredResults as Pokemon[]);
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
