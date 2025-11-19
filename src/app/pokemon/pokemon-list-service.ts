import { Injectable} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { inject } from '@angular/core';
import { PokeApiService } from './pokeapi-service';
import { NamedAPIResource, Pokemon } from './models/pokemon-models';

@Injectable({
  providedIn: 'root'
})
export class PokemonListService {
  private readonly service = inject(PokeApiService);

  readonly allPokemon = toSignal(this.service.getAllPokemon(), {initialValue: [] as Pokemon[]});
  readonly allPokemonResource = toSignal(this.service.getAllPokemonResource(), {initialValue: [] as NamedAPIResource[]});

  getPokemonFromMemory(id: number | string | undefined): Pokemon | undefined {
    if (id == null) return undefined;
    const idNum = Number(id);
    const all = this.allPokemon();
    return all.find(p => p.id === idNum);
  }
}
