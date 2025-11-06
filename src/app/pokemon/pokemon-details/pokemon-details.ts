import { Component, inject } from '@angular/core';
import { Pokemon } from '../models/pokemon-models';
import { computed } from '@angular/core';
import { input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe, TitleCasePipe } from '@angular/common';
import { PokemonCard } from '../pokemon-card/pokemon-card';

@Component({
  selector: 'app-pokemon-details',
  imports: [TitleCasePipe, PokemonCard, DecimalPipe],
  templateUrl: './pokemon-details.html',
  styleUrl: './pokemon-details.css'
})
export class PokemonDetails {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly pokemon = input.required<Pokemon>();

  protected readonly isLoading = computed(() => this.pokemon() === undefined);
}
