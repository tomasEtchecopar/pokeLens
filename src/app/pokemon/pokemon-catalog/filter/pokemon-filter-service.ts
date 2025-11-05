import { computed, inject, Injectable, signal } from '@angular/core';
import { Pokemon } from '../../models/pokemon-models';
import { FilterOptions } from '../../models/pokemon-filters';
import { PokemonService } from '../../pokemon-service';
import { toSignal } from '@angular/core/rxjs-interop';


@Injectable({
  providedIn: 'root'
})
// Service that manages the pokemon list; search, pagination and ordering are done over it
export class PokemonFilterService{
  private readonly service = inject(PokemonService);
  private readonly allPokemon = toSignal(this.service.getAllPokemon(), {initialValue: [] as Pokemon[]});

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

    return list;
  }
}
