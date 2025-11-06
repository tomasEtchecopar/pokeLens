import { Component, computed, inject, input } from '@angular/core';
import { PokemonService } from '../pokemon-service';
import { Pokemon } from '../models/pokemon-models';
import { NgOptimizedImage, TitleCasePipe } from '@angular/common';
import { translateType } from '../models/pokemon-helpers';

/**
 * Card component that displays a single Pokemon.
 */
@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [TitleCasePipe, NgOptimizedImage],
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.css'
})
export class PokemonCard {

  readonly pokemon= input.required<Pokemon>();


  protected readonly isLoading = computed(() => this.pokemon() === undefined);
  
  protected translateType = translateType;
}
