import { Injectable, signal } from '@angular/core';
import { NamedAPIResource } from '../../pokemon-models';
import { filterType } from './pokemon-filter-type';

@Injectable({
  providedIn: 'root'
})
export class PokemonCatalogFilter {
  private readonly allPokemon = signal<NamedAPIResource[]>;
  private readonly filteredPokemon;

  private readonly filterType = signal<filterType>
  
}
