import { Component, DestroyRef, ElementRef, ViewChild } from '@angular/core';
import { PokemonService } from '../pokemon-service';
import { inject } from '@angular/core';
import { computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { effect } from '@angular/core';
import { Router } from '@angular/router';
import { PokemonCard } from '../pokemon-card/pokemon-card';
import { signal } from '@angular/core';
import { NamedAPIResource } from '../pokemon-models';
import { toSignal } from '@angular/core/rxjs-interop';
import { PokemonCatalogSearch } from './pokemon-catalog-search';
import { SearchBar } from "../../search-bar/search-bar";

/**
 * Pokemon catalog component with infinite scroll and reactive search.
 * 
 * Shows a grid of Pokemon cards that loads more as you scroll down.
 * Includes a search bar that filters Pokemon by name in real-time.
 */
@Component({
  selector: 'app-pokemon-catalog',
  imports: [PokemonCard, ReactiveFormsModule, SearchBar],
  templateUrl: './pokemon-catalog.html',
  styleUrl: './pokemon-catalog.css'
})
export class PokemonCatalog {

  // cachear 1000 pokemon
  // modularizar busqueda e infinite scroll en servicios
  // USAR OBSERVABLES 
  
  //hacer un componente que sirva de barra de busqueda en toda la pagina
  // hacer servicio pokemon-catalog-search que use ese componente y haga la logica

  //hacer servicio para infinite scroll en toda la pagina
  //hacer servicio pokemon-catalog-displayed o pokemon-catalog-scrolling (o algo asi) que maneje la logica de paginación

  //que pokemon-catalog solo sea la ui y llame a los demas componentes

  // services and utilities
  private readonly service = inject(PokemonService); // handles API calls to PokeAPI
  private readonly router = inject(Router); // for navigating to Pokemon details
  private readonly pokemonSearch = inject(PokemonCatalogSearch);

  protected readonly allPokemon = toSignal(this.service.getAllPokemon());

  // infinite scroll detection
  @ViewChild('scrollSentinel') scrollSentinel?: ElementRef; // invisible element at bottom of list

  protected readonly searchResults = this.pokemonSearch.results;
  // pagination state
  private readonly pageSize = 20; // how many Pokemon to fetch per batch
  private offset = signal(0); // current position in the full Pokemon list
  protected readonly hasMore = signal(true); // whether there are more Pokemon to load
  protected readonly isLoadingMore = signal(false); // loading indicator for pagination

  //all pokemon available to display
  protected readonly loadedPokemon = computed<NamedAPIResource[]>(() => {
    const term = (this.pokemonSearch.searchTerm?.() ?? '').trim();
    if (term) return this.searchResults();
    
    const list = this.allPokemon() as unknown as NamedAPIResource[] ?? [];
    return list;
  })



  /**
   * Shows loading state on initial 
   */
  protected readonly isLoading = computed(() =>
    this.loadedPokemon().length === 0 && !this.isLoadingMore() 
  );

  /**
   * Navigates to the detail page for a specific Pokemon.
   */
  navigateToDetails(id: string | number): void {
    this.router.navigateByUrl(`catalogo/${id}`);
  }


}