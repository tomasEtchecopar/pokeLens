import { toSignal } from '@angular/core/rxjs-interop';
import { signal } from '@angular/core';
import { effect } from '@angular/core';
import { Injectable } from '@angular/core';
import { PokemonListService } from '../pokemon-list-service';
import { inject } from '@angular/core';
import { computed } from '@angular/core';
import { Pokemon } from '../models/pokemon-models';
import { PokeApiService } from '../pokeapi-service';

@Injectable({
  providedIn: 'root'
})
export class DailyPokemonService {
  private readonly pokeListService = inject(PokemonListService);
  private readonly pokeApiService = inject(PokeApiService)

  private readonly salt = 'esta-es-una-string-para-aumentar-aleatoriedad';
  private readonly _pokemonOfTheDay = signal<Pokemon | null>(null);

  readonly pokemonOfTheDay = computed(() => this._pokemonOfTheDay());
  readonly isLoading = signal(false);

  constructor() {
    effect(() => {
      this.loadDailyPokemon();
    })
  }
  //algorithm mulberry32
  private mulberry32(seed: number) {
    return function () {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  //generates index based on current date
  private loadDailyPokemon(): void {
    const allPokemon = this.pokeListService.allPokemonResource();
    if (allPokemon.length === 0) return;

    const today = new Date().toISOString().split('T')[0]; //yyy-mm-dd
    const seed = this.hashString(`${today}|${this.salt}`);
    const rng = this.mulberry32(seed);
    const index = Math.floor(rng() * allPokemon.length);
    const resourceName = allPokemon[index].name;

    const fromMemory = this.pokeListService.getPokemonFromMemory(index + 1);
    if (fromMemory) {
      this._pokemonOfTheDay.set(fromMemory);
      return
    }

    this.isLoading.set(true);
    this.pokeApiService.getPokemon(resourceName).subscribe({
      next: (pokemon) => {
        this._pokemonOfTheDay.set(pokemon);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('error getting daily pokemon: ', error);
        this.isLoading.set(false);
      }
    });
  }

  //converts string to consistent numeric hash
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = hash * 31 + str.charCodeAt(i);
      hash = hash | 0;
    }
    return Math.abs(hash);
  }

}
