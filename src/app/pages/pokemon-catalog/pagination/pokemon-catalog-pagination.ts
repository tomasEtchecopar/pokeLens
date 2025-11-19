import { Injectable, signal } from '@angular/core';
import { computed } from '@angular/core';
import { NgZone } from '@angular/core';
import { Pokemon } from '../../../pokemon/models/pokemon-models';

/**
 * PokemonCatalogPagination handles infinite scroll pagination for pokemon lists.
 * Uses IntersectionObserver for efficient scroll detection and loads chunks progressively.
 */
@Injectable({
  providedIn: 'root'
})
export class PokemonCatalogPagination {
  // Full list of pokemon to paginate through
  private readonly pokemonList = signal<Pokemon[]>([]);
  // Currently loaded/visible pokemons
  private readonly loadedPokemon = signal<Pokemon[]>([])
  private pageSize = 20;
  private readonly offset = signal(0);
  private readonly hasMore = signal(true);
  private readonly isLoading = signal(false);

  // Public signals for component consumption
  readonly displayedPokemon = computed(() => this.loadedPokemon());
  readonly loading = computed(() => this.isLoading());
  readonly hasMoreAvailable = computed(() => this.hasMore());

  private observer?: IntersectionObserver

  constructor(private readonly ngZone: NgZone) { }

  /**
   * Initializes pagination with a new pokemon list.
   * Resets state and loads the first chunk.
   */
  setPokemonList(list: Pokemon[], pageSize: number = 20): void {
    console.log("raw list: ", list);
    this.pokemonList.set(list ?? []);
    this.pageSize = pageSize;
    this.offset.set(0);
    this.loadedPokemon.set([]);
    this.hasMore.set((list ?? []).length > 0);
    this.loadMore();
  }

  /**
   * Loads the next chunk of pokemon.
   * Wrapped in setTimeout to avoid blocking the UI thread.
   */
  loadMore(): void {
    if (this.isLoading() || !this.hasMore()) return;

    this.isLoading.set(true);

    setTimeout(() => {
      console.log("loading more pokemon...");
      const list = this.pokemonList();
      const offset = this.offset();

      // Reached the end
      if (offset >= list.length) {
        this.hasMore.set(false);
        this.isLoading.set(false);
        return;
      }

      const nextChunk = list.slice(offset, offset + this.pageSize);
      console.log("Loading pokemons: ", nextChunk as Pokemon[]);

      this.loadedPokemon.set([...this.loadedPokemon(), ...nextChunk]);
      console.log("Loaded pokemons: ", this.loadedPokemon() as Pokemon[]);

      this.offset.set(offset + nextChunk.length);
      this.hasMore.set(this.offset() < this.pokemonList().length);
      this.isLoading.set(false);
    }, 0);
  }

  /**
   * Sets up infinite scroll using IntersectionObserver.
   * Runs outside Angular zone for better performance.
   *
   * @param sentinel - HTML element to observe (typically at the bottom of the list)
   */
  initScroll(sentinel: HTMLElement): void {
    this.ngZone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            console.log("Scroll limit reached");
            // Re-enter Angular zone to trigger change detection
            this.ngZone.run(() => this.loadMore());
          }
        }
      }, {
        root: null,
        rootMargin: '100px',  // Trigger 100px before reaching sentinel
        threshold: 0.1
      });
      this.observer.observe(sentinel);
    });
  }

  /**
   * Cleans up the IntersectionObserver when component is destroyed.
   */
  disconnect(): void {
    this.observer?.disconnect();
  }
}
