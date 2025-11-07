import { Component, inject, linkedSignal } from '@angular/core';
import { computed } from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { PokemonCard } from '../pokemon-card/pokemon-card';
import { PokeApiService } from '../pokeapi-service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-pokemon-details',
  imports: [TitleCasePipe, PokemonCard, DecimalPipe],
  templateUrl: './pokemon-details.html',
  styleUrl: './pokemon-details.css'
})
export class PokemonDetails {
  private readonly service = inject(PokeApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly pokemonName = this.route.snapshot.paramMap.get('name');

  protected readonly pokemon= toSignal(this.service.getPokemon(this.pokemonName!));

  protected readonly isLoading = computed(() => this.pokemon() === undefined);
}
