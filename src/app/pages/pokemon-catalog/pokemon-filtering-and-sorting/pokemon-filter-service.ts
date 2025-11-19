import { computed, inject, Injectable, signal } from '@angular/core';
import { SortOption } from '../../../pokemon/models/pokemon-sort';
import { PokemonListService } from '../../../pokemon/pokemon-list-service';
import { Pokemon } from '../../../pokemon/models/pokemon-models';
import { FilterOptions } from '../../../pokemon/models/pokemon-filters';


@Injectable({
  providedIn: 'root'
})
// Service that manages the pokemon list; search, pagination and ordering are done over it
export class PokemonFilterService{

  private readonly pokemonListService = inject(PokemonListService);

  readonly allPokemon = this.pokemonListService.allPokemon;

  private readonly filters = signal<FilterOptions>({});

  private readonly sort = signal<SortOption | null>(null);

  readonly filteredPokemon = computed(() => this.applyFilters());

  readonly currentSort = computed(() => this.sort());

  readonly currentFilters = computed(() => this.filters());

  updateFilters(filters: FilterOptions){
    this.filters.set(filters);
  }

  clearFilters(){
    this.filters.set({});
  }
   setSort(option: SortOption | null){
    this.sort.set(option);
  }
  clearSort(){
    this.sort.set(null);
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

   private sortPokemon(list: Pokemon[], sortOption: SortOption): Pokemon[] {
    const { key, dir } = sortOption;
    const multiplier = dir === 'asc' ? 1 : -1;

    return [...list].sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (key) {
        case 'id':
          valA = a.id;
          valB = b.id;
          break;
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'generation':
          valA = a.generation || '';
          valB = b.generation || '';
          break;
        case 'height':
          valA = a.height;
          valB = b.height;
          break;
        case 'weight':
          valA = a.weight;
          valB = b.weight;
          break;
        default:
          return 0;
      }

      if (valA < valB) return -1 * multiplier;
      if (valA > valB) return 1 * multiplier;
      return 0;
    });
  }

  private applyFiltersAndSort(): Pokemon[] {
    let list = this.applyFilters();

    // Aplicar ordenamiento si existe
    const sortOption = this.sort();
    if (sortOption) {
      list = this.sortPokemon(list, sortOption);
    }

    return list;
  }
}
