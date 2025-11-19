import { Component, inject, input, computed } from '@angular/core';
import { Pokemon } from '../models/pokemon-models';
import { PokemonAudioService } from '../pokemon-audio-service';


@Component({
  selector: 'app-pokemon-cry-button',
  standalone: true,
  template: `
    <button
      class="cry-button"
      [class.playing]="isPlaying()"
      [disabled]="!hasCry()"
      (click)="toggleCry($event)"
      [title]="hasCry() ? (isPlaying() ? 'Detener sonido' : 'Escuchar cry') : 'No hay sonido disponible'"
    >
      @if (isPlaying()) {
        <span class="icon">♪</span>
      } @else {
        <span class="icon">♫</span>
      }
    </button>
  `,
  styles: [`
    .cry-button {
      width: 24px;
      height: 24px;
      background: #2c2c2c;
      border: 2px solid #1a1a1a;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.1s ease;
      box-shadow: 2px 2px 0 #1a1a1a;
      padding: 0;
    }
    .cry-button:hover:not(:disabled) {
      background: #3a3a3a;
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 #1a1a1a;
    }
    .cry-button:active:not(:disabled) {
      transform: translate(2px, 2px);
      box-shadow: 0 0 0 #1a1a1a;
      background: #1a1a1a;
    }
    .cry-button:disabled {
      background: #3a3a3a;
      cursor: not-allowed;
      opacity: 0.4;
    }
    .cry-button.playing {
      background: #4aad4e;
      animation: blink 0.8s infinite;
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .icon {
      font-size: 0.9rem;
      color: #9dbc9b;
      font-weight: bold;
      line-height: 1;
    }
    .cry-button.playing .icon {
      color: #fff;
    }
    .cry-button:disabled .icon {
      color: #555;
    }
  `]
})
export class PokemonCryButton {
  private readonly audioService = inject(PokemonAudioService);

  pokemon = input.required<Pokemon>();

  // Checks if pokemon has any available cry audio (prefers latest, falls back to legacy)
  hasCry = computed(() => {
    const p = this.pokemon();
    return !!(p.cries?.latest || p.cries?.legacy);
  });

  // Reactively checks if this specific pokemon cry is currently playing
  isPlaying = computed(() => {
    const p = this.pokemon();
    return this.audioService.isPlayingPokemon(p.id);
  });

  /**
   * Toggles cry playback
   */
  toggleCry(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const p = this.pokemon();
    const cryUrl = p.cries?.latest || p.cries?.legacy;
    this.audioService.toggleCry(cryUrl, p.id);
  }
}
