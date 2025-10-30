import { Component, DestroyRef, ElementRef, ViewChild } from '@angular/core';
import { PokemonService } from '../pokemon-service';
import { inject } from '@angular/core';
import { computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PokemonCard } from '../pokemon-card/pokemon-card';
import { signal } from '@angular/core';
import { NamedAPIResource } from '../pokemon-models';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

/**
 * Pokemon catalog component with infinite scroll and reactive search.
 * 
 * Shows a grid of Pokemon cards that loads more as you scroll down.
 * Includes a search bar that filters Pokemon by name in real-time.
 */
@Component({
  selector: 'app-pokemon-catalog',
  imports: [PokemonCard, ReactiveFormsModule],
  templateUrl: './pokemon-catalog.html',
  styleUrl: './pokemon-catalog.css'
})
export class PokemonCatalog {

  // services and utilities
  private readonly service = inject(PokemonService); // handles API calls to PokeAPI
  private readonly router = inject(Router); // for navigating to Pokemon details
  private readonly destroyRef = inject(DestroyRef) 

  // infinite scroll detection
  @ViewChild('scrollSentinel') scrollSentinel?: ElementRef; // invisible element at bottom of list

  // search state
  protected readonly searchControl = new FormControl(''); // input field binding
  protected readonly searchTerm = toSignal(
  this.searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    map(term => term || '')
  ),
  { initialValue: '' }
);; // reactive search term for computed properties
  protected readonly searchResults = signal<NamedAPIResource[]>([]); // filtered Pokemon from search
  protected readonly isSearching = signal(false); // loading indicator for search

  // pagination state
  private readonly pageSize = 20; // how many Pokemon to fetch per batch
  private offset = signal(0); // current position in the full Pokemon list
  protected readonly allPokemon = signal<NamedAPIResource[]>([]); // all loaded Pokemon so far
  protected readonly hasMore = signal(true); // whether there are more Pokemon to load
  protected readonly isLoadingMore = signal(false); // loading indicator for pagination

  /**
   * Returns either search results or the full catalog depending on search state.
   * This is what actually gets displayed in the template.
   */
  protected readonly displayedPokemon = computed(() => {
    return this.searchTerm().trim() ? this.searchResults() : this.allPokemon(); 
  });

  /**
   * Checks if we're currently in search mode (user has typed something).
   * Used to disable infinite scroll during search.
   */
  protected readonly isInSearchMode = computed(() => {
    const searchTerm = this.searchControl.value;
    return !!(searchTerm && searchTerm.trim());
  });

  /**
   * Fetches the next batch of Pokemon for infinite scroll.
   * Won't load if already loading or no more results.
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

  /**
   * Initialization - loads first batch and sets up reactive search.
   */
  ngOnInit() {
    // load initial batch of Pokemon
    this.loadMorePokemon();

    
    this.searchControl.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef), // auto-unsubscribe on component destroy
      debounceTime(300), // wait 300ms after user stops typing
      distinctUntilChanged(), // only search if value actually changed
      switchMap(term => {
        const searchTerm = term || '';
        
        // update reactive search term
        this.searchTerm.set(searchTerm);
        
        // empty search = show all Pokemon
        if (!searchTerm.trim()) {
          this.isSearching.set(false);
          this.searchResults.set([]);
          return of({ count: 0, next: null, previous: null, results: [] });
        }
        
        // perform search
        this.isSearching.set(true);
        return this.service.searchPokemon(searchTerm);
      })
    ).subscribe({
      next: (data) => {
        console.log('Search results received:', data);
        
        if (data && data.results && Array.isArray(data.results)) {
          this.searchResults.set(data.results);
        } else {
          console.log('No valid results');
          this.searchResults.set([]);
        }
        
        this.isSearching.set(false);
      },
      error: (err) => {
        console.error('Search error:', err);
        this.searchResults.set([]);
        this.isSearching.set(false);
      }
    });
  }

  /**
   * Sets up infinite scroll by watching when the sentinel element comes into view.
   * Only triggers when NOT in search mode.
   */
  ngAfterViewInit() {
    if (!this.scrollSentinel?.nativeElement) return;

    const observer = new IntersectionObserver((entries) => {
      // only trigger infinite scroll when not searching
      if (entries[0].isIntersecting && !this.isInSearchMode()) {
        this.loadMorePokemon();
      }
    }, {
      threshold: 0.1 // trigger when 10% of sentinel is visible
    });

    observer.observe(this.scrollSentinel.nativeElement);
  }



  /**
   * Shows loading state only on initial load (not during search or pagination).
   */
  protected readonly isLoading = computed(() =>
    this.allPokemon().length === 0 && !this.isLoadingMore() && !this.isInSearchMode()
  );

  /**
   * Navigates to the detail page for a specific Pokemon.
   */
  navigateToDetails(id: string | number) {
    this.router.navigateByUrl(`catalogo/${id}`);
  }

  /**
   * Clears the search input and returns to full catalog view.
   */
  protected clearSearch() {
    this.searchControl.setValue('');
  }
}