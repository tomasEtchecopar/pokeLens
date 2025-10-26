import { Component, computed, inject, input } from '@angular/core';
import { Input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PokemonService } from '../pokemon-service';
import { signal } from '@angular/core';
import { NamedAPIResource, Pokemon } from '../pokemon-models';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-pokemon-card',
  imports: [TitleCasePipe],
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.css'
})
export class PokemonCard {

  private service = inject(PokemonService);

  readonly pokemonResource = input.required<NamedAPIResource>();

  protected readonly isLoading = computed(() => this.pokemonResource() === undefined);
}
