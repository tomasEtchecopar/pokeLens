import { Injectable, signal } from '@angular/core';
import { NamedAPIResource } from '../../pokemon-models';
import { filterType } from './pokemon-filters';

@Injectable({
  providedIn: 'root'
})
export class PokemonCatalogFilter {
  /* private readonly filteredPokemon; */

  private readonly filterType = signal<filterType>('all');
  
  setFilter(type:filterType){
    this.filterType.set(type);
  }

  getFilteredList(){
    
  }
}
