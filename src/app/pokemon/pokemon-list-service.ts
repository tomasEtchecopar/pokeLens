import { Injectable, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { inject } from '@angular/core';
import { PokemonService } from './pokemon-service';
import { Pokemon } from './models/pokemon-models';

@Injectable({
  providedIn: 'root'
})
export class PokemonListService {
  private readonly service = inject(PokemonService);
  
  readonly allPokemon = toSignal(this.service.getAllPokemon(), {initialValue: [] as Pokemon[]});

}
