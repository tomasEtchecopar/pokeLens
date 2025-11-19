import { Component,  inject,  input } from '@angular/core';
import { Pokemon } from '../models/pokemon-models';
import {  TitleCasePipe } from '@angular/common';
import { signal } from '@angular/core';
import { translateType } from '../models/pokemon-helpers';
import { Router } from "@angular/router";
import { AddPokemonModal } from '../../pages/profile/pokemon-collections/add-pokemon-modal';
import { PokemonCryButton } from './pokemon-cry-button';

/**
 * Card component that displays a single Pokemon.
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
  readonly pokemon= input.required<Pokemon>();
  readonly nickname = input<string>();



  protected translateType = translateType;

  navigateToDetails(name: string): void {
    this.router.navigateByUrl(`details/${name}`);
  }
 // Nuevo: control del modal
  showCaptureModal = signal(false);

  // Nuevo: mostrar/ocultar botón de captura
  showCaptureButton = input(true);

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
    // Opcional: emitir evento o mostrar notificación
  }
}
