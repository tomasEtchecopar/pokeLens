import { Injectable, signal } from '@angular/core';
import { filterType } from './pokemon-filters';
import { Pokemon } from '../../pokemon-models';

@Injectable({
  providedIn: 'root'
})
// Service that manages the pokemon list; search, pagination and ordering are done over it
export class PokemonCatalogFilter {
  private readonly filteredPokemon = signal<Pokemon[]>;

  private readonly filterType = signal<filterType>('all');
  
  setFilter(type:filterType){
    this.filterType.set(type);
  }

  getFilteredList(){
    switch(this.filterType()){
      case 'all':

    }
    
  }
}
