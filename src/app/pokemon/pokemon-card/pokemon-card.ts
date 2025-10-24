import { Component, computed, inject } from '@angular/core';
import { Input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PokemonService } from '../pokemon-service';

@Component({
  selector: 'app-pokemon-card',
  imports: [],
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.css'
})
export class PokemonCard {
 /** Reference object with Pokémon name or URL from the list */
  @Input() pokemonRef!: { name: string; url: string };

  /** Inject PokemonService */
  private service = inject(PokemonService);

  /**
   * Signal with the Pokémon details.
   * Converts the observable returned by the service into a signal.
   * Automatically updates when the observable emits new values.
   */
  pokemonDetail = toSignal(
    this.service.getPokemon(this.pokemonRef.name)
  );
}
