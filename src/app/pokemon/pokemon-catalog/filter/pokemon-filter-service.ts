import { computed, inject, Injectable, signal } from '@angular/core';
import { Pokemon, filterType } from '../../models/pokemon-models';
import { PokemonService } from '../../pokemon-service';
import { toSignal } from '@angular/core/rxjs-interop';


@Injectable({
  providedIn: 'root'
})
// Service that manages the pokemon list; search, pagination and ordering are done over it
export class PokemonFilterService{
  private readonly service = inject(PokemonService);
  private readonly allPokemon = toSignal(this.service.getAllPokemon(), {initialValue: [] as Pokemon[]});

  private readonly filterType = signal<filterType>('all');
  
  setFilter(type:filterType){
    this.filterType.set(type);
  }

  readonly filteredPokemon = computed(() => {
    const type = this.filterType();
    const list = this.allPokemon();

    switch(type){
      case 'all':
        console.log("getting pokemons of all types", list as Pokemon[])
        return list;
      default:
        console.log("getting pokemons of type " + type)
        return list.filter(p => p.types.some(t => t.type.name === type));
    }
  })

}
