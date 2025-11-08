import { Injectable } from '@angular/core';
import { PokemonListService } from './pokemon-list-service';
import { inject } from '@angular/core';
import { computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DailyPokemonService {
  private readonly pokeListService = inject(PokemonListService);

  readonly pokemonOfTheDay = computed(() => {
    const allPokemon = this.pokeListService.allPokemon();
    if(allPokemon.length === 0) return null;

    const today = new Date().toISOString().split('T')[0];
    const seed = this.hashString(today);
    const index = seed % allPokemon.length;

    return allPokemon[index];
  });

  private hashString(str: string): number{
    let hash = 0;
    for(let i = 0; i<str.length;i++){
      hash =((hash << 5) - hash) + str.charCodeAt(i);
      hash= hash & hash;
    }
    return Math.abs(hash);
  }
  
}
