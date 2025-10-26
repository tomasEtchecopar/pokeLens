import { Component } from '@angular/core';
import { PokemonService } from '../pokemon-service';
import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { computed } from '@angular/core';
import { Router } from '@angular/router';
import { PokemonCard } from '../pokemon-card/pokemon-card';

@Component({
  selector: 'app-pokemon-catalog',
  imports: [PokemonCard],
  templateUrl: './pokemon-catalog.html',
  styleUrl: './pokemon-catalog.css'
})
/**
 * Component model for the Pokémon catalog landing page.
 * 
 * Responsibilities:
 * - Fetch and expose a paginated list of Pokémon from the service.
 * - Provide a loading state derived from data availability.
 * - Handle navigation to a Pokémon details page.
 */
export class PokemonCatalog {

  private readonly service = inject(PokemonService); //Injected service used to retrieve Pokémon data from the API.
  private readonly router = inject(Router); //Injected Angular Router used for navigation within the app.

  protected readonly pokemons = toSignal(this.service.getPokemonList());


  protected readonly isLoading = computed(() => this.pokemons() === undefined);

  /**
  * Navigates to the Pokémon detail page for the given identifier.
  *
  * @param id Pokémon numeric ID or name string.
  */
  navigateToDetails(id: string | number) {
    this.router.navigateByUrl(`catalogo/${id}`);
  }
}
