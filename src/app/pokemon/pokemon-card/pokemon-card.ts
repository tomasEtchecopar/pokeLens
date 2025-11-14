import { Component, computed,  inject,  input } from '@angular/core';
import { Pokemon } from '../models/pokemon-models';
import { NgOptimizedImage, TitleCasePipe } from '@angular/common';
import { translateType } from '../models/pokemon-helpers';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";

/**
 * Card component that displays a single Pokemon.
 */
@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.css'
})
export class PokemonCard {
  private readonly router = inject(Router);
  readonly pokemon= input.required<Pokemon>();



  protected translateType = translateType;

  navigateToDetails(name: string): void {
    this.router.navigateByUrl(`details/${name}`);
  }
}
