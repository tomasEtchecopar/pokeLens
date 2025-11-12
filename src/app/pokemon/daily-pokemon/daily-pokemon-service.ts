import { Injectable } from '@angular/core';
import { PokemonListService } from '../pokemon-list-service';
import { inject } from '@angular/core';
import { computed } from '@angular/core';
import { Pokemon } from '../models/pokemon-models';

@Injectable({
  providedIn: 'root'
})
export class DailyPokemonService {
  private readonly pokeListService = inject(PokemonListService);
  private readonly salt = 'esta-es-una-string-para-aumentar-aleatoriedad';

  //algorithm mulberry32
   private mulberry32(seed: number) {
    return function() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  //generates index based on current date
  readonly pokemonOfTheDay = computed(() => {
    const allPokemon = this.pokeListService.allPokemonResource();
    if(allPokemon.length === 0) return null;

    const today = new Date().toISOString().split('T')[0]; //yyy-mm-dd
    const seed = this.hashString(`${today}|${this.salt}`); 
    const rng = this.mulberry32(seed);
    const index = Math.floor(rng() * allPokemon.length);

    const pokemon = this.pokeListService.allPokemon()[index];
    if(pokemon){
      return pokemon;
    }else{
    return allPokemon[index] as unknown as Pokemon;
    }
  });

  //converts string to consistent numeric hash 
  private hashString(str: string): number{
    let hash = 0;
    for(let i = 0; i<str.length;i++){
      hash = hash * 31+ str.charCodeAt(i);
      hash= hash | 0;
    }
    return Math.abs(hash);
  }
  
}
