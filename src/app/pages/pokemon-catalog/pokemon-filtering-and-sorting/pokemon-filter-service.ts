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

  //after all filters are applied

  const currentSort = this.sort();

  if(currentSort && list && list.length >1){
    list = [...list];
    const key = currentSort.key;
    const dir = currentSort.dir === 'asc' ? 1: -1;


  const compare = (a: Pokemon, b: Pokemon) =>{
    let aValue: any, bValue:any;

    switch(key){
      case 'id':
        aValue = a.id ?? 0;
        bValue = b.id?? 0;
        break;
        case 'name':
          aValue = (a.name ?? '').toString().toLowerCase();
          bValue = (b.name ?? '').toString().toLowerCase();
        break;
      case 'generation':
        aValue = (a.generation ?? '').toString().toLowerCase();
        bValue = (b.generation ?? '').toString().toLowerCase();
        break;
      case 'height':
        aValue = a.height ?? 0;
        bValue = b.height  ?? 0;
        break;
      case 'weight':
        aValue = a.weight ?? 0;
        bValue = b.weight  ?? 0;
        break;
        default:
          aValue=0;
          bValue=0;
    }

    if(aValue<bValue) return -1 * dir;
    if(aValue > bValue) return 1 * dir;
    return ((a.id ?? 0) - (b.id ?? 0));
  }

  list.sort(compare);

}
    return list;
  }

  setSort(option: SortOption | null){
    this.sort.set(option);
  }
  clearSort(){
    this.sort.set(null);
  }
}
