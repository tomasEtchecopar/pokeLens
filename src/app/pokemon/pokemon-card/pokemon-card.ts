import { Component, inject, input } from '@angular/core';
import { Pokemon } from '../models/pokemon-models';
import { TitleCasePipe } from '@angular/common';
import { signal } from '@angular/core';
import { translateRarity, translateType } from '../models/pokemon-helpers';
import { Router } from "@angular/router";
import { AddPokemonModal } from '../../pages/pokemon-teams/add-pokemon-modal';
import { PokemonCryButton } from './pokemon-cry-button';

/**
 * PokemonCard displays a single pokemon.
 * Supports custom nicknames and navigates to details on click.
 */
@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [TitleCasePipe, AddPokemonModal, PokemonCryButton],
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.css'
})
export class PokemonCard {
  private readonly router = inject(Router);

  readonly pokemon = input.required<Pokemon>();
  readonly nickname = input<string>(); // optional nickname; used in teams

  protected translateType = translateType;
  protected translateRarity = translateRarity;

  navigateToDetails(name: string): void {
    this.router.navigateByUrl(`details/${name}`);
  }

  // Modal state
  showCaptureModal = signal(false);
  showCaptureButton = input(true); // Can hide capture button in team views

  /**
   * Opens capture modal while preventing card click navigation.
   */
  openCaptureModal(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.showCaptureModal.set(true);
  }

  closeCaptureModal() {
    this.showCaptureModal.set(false);
  }

  onPokemonCaptured() {
    this.showCaptureModal.set(false);
  }
}
