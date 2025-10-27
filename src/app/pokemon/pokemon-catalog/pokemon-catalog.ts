import { Component, ElementRef, ViewChild } from '@angular/core';
import { PokemonService } from '../pokemon-service';
import { inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { computed } from '@angular/core';
import { Router } from '@angular/router';
import { PokemonCard } from '../pokemon-card/pokemon-card';
import { signal } from '@angular/core';
import { NamedAPIResource } from '../pokemon-models';
import { NamedAPIResourceList } from '../pokemon-models';

@Component({
  selector: 'app-pokemon-catalog',
  imports: [PokemonCard],
  templateUrl: './pokemon-catalog.html',
  styleUrl: './pokemon-catalog.css'
})
/**
 * Component model for the Pokemon catalog landing page with infinite scroll.
 * 
*/
export class PokemonCatalog {

  private readonly service = inject(PokemonService); //Injected service used to retrieve Pokemon data from the API.
  private readonly router = inject(Router); //Injected Angular Router used for navigation within the app.

  // Element reference for detecting when user scrolls to bottom
  @ViewChild('scrollSentinel') scrollSentinel?: ElementRef;

  private readonly pageSize = 20; // Number of Pokemon to load per batch
  private offset = signal(0); // Current pagination offset
  protected readonly allPokemon = signal<NamedAPIResource[]>([]); // Accumulated list of all loaded Pokemon
  protected readonly hasMore = signal(true); // Whether more Pokemon are available
  protected readonly isLoadingMore = signal(false); // Loading state for pagination

  /**
   * Loads the next batch of Pokemon from the API.
   */
  private loadMorePokemon() {
    if (!this.hasMore() || this.isLoadingMore()) return;

    this.isLoadingMore.set(true);
    this.service.getPokemonList(this.pageSize, this.offset()).subscribe({
      next: (data) => {
        const newPokemon = data.results;
        this.allPokemon.set([...this.allPokemon(), ...newPokemon]);
        this.hasMore.set(data.next !== null);
        this.offset.set(this.offset() + this.pageSize);
        this.isLoadingMore.set(false);
      },
      error: () => {
        this.isLoadingMore.set(false);
      }
    });
  }

  ngOnInit() {
    // Load initial batch
    this.loadMorePokemon();
  }

  /**
   * Sets up Intersection Observer to detect when the scroll sentinel is visible.
   */
  ngAfterViewInit() {
    if (!this.scrollSentinel?.nativeElement) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        this.loadMorePokemon();
      }
    }, {
      threshold: 0.1
    });

    observer.observe(this.scrollSentinel.nativeElement);
  }

  protected readonly isLoading = computed(() => this.allPokemon().length === 0 && !this.isLoadingMore());

  /**
  * Navigates to the Pokemon detail page for the given identifier.
  *
  * @param id Pokemon numeric ID or name string.
  */
  navigateToDetails(id: string | number) {
    this.router.navigateByUrl(`catalogo/${id}`);
  }
}
