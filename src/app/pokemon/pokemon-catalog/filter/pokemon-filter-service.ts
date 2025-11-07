import { computed, inject, Injectable, signal } from '@angular/core';
import { Pokemon } from '../../models/pokemon-models';
import { FilterOptions } from '../../models/pokemon-filters';
import { PokeApiService } from '../../pokeapi-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { PokemonListService } from '../../pokemon-list-service';


@Injectable({
  providedIn: 'root'
})
// Service that manages the pokemon list; search, pagination and ordering are done over it
export class PokemonFilterService{

  private readonly pokemonListService = inject(PokemonListService);

  readonly allPokemon = this.pokemonListService.allPokemon;

  private readonly filters = signal<FilterOptions>({});

  readonly filteredPokemon = computed(() => this.applyFilters());

  updateFilters(filters: FilterOptions){
    this.filters.set(filters);
  }
  
  clearFilters(){
    this.filters.set({});
  }

  private applyFilters(): Pokemon[]{
    let list=this.allPokemon();
    const f = this.filters();
    console.log("applying filters: ", f as FilterOptions);

    if(f.type){
      list=list.filter(p => p.types.some(t => t.type.name === f.type))
    }
    if (f.generation) {
      list = list.filter(p => p.generation === f.generation);
    }
    if(f.region){
      list=list.filter(p => p.region ===f.region);
    }
    if (f.minHeight !== undefined) list = list.filter(p => p.height >= f.minHeight!);
    if (f.maxHeight !== undefined) list = list.filter(p => p.height <= f.maxHeight!);
    if (f.minWeight !== undefined) list = list.filter(p => p.weight >= f.minWeight!);
    if (f.maxWeight !== undefined) list = list.filter(p => p.weight <= f.maxWeight!)

    return list;
  }
}
