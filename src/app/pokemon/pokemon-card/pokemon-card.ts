import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PokemonService } from '../pokemon-service';
import { NamedAPIResource, Pokemon } from '../pokemon-models';
import { NgOptimizedImage, TitleCasePipe } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { PokeImgPipe } from '../poke-img-pipe';
import { translateType } from '../pokemon-helpers';

/**
 * Card component that displays a single Pokemon.
 * 
 * Takes a resource with name and URL, then fetches the full Pokemon details to show them in card format. 
 */
@Component({
  selector: 'app-pokemon-card',
  imports: [TitleCasePipe, PokeImgPipe, NgOptimizedImage],
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.css'
})
export class PokemonCard {

  private service = inject(PokemonService);

  readonly pokemon= input.required<Pokemon>();


  protected readonly isLoading = computed(() => this.pokemon() === undefined);
  
  protected translateType = translateType;
}
