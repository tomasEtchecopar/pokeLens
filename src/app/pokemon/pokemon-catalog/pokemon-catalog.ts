import { Component, ElementRef, ViewChild } from '@angular/core';
import { PokemonService } from '../pokemon-service';
import { inject } from '@angular/core';
import { computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PokemonCard } from '../pokemon-card/pokemon-card';
import { signal } from '@angular/core';
import { NamedAPIResource } from '../pokemon-models';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import { of } from 'rxjs';

@Component({
  selector: 'app-pokemon-catalog',
  imports: [PokemonCard, ReactiveFormsModule],
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
  private destroy$ = new Subject<void>();


  // Element reference for detecting when user scrolls to bottom
  @ViewChild('scrollSentinel') scrollSentinel?: ElementRef;

  //search
  protected readonly searchControl = new FormControl('');
  protected readonly searchTerm = signal('');
  protected readonly searchResults = signal<NamedAPIResource[]>([]);
  protected readonly isSearching = signal(false);

  private readonly pageSize = 20; // Number of Pokemon to load per batch
  private offset = signal(0); // Current pagination offset
  protected readonly allPokemon = signal<NamedAPIResource[]>([]); // Accumulated list of all loaded Pokemon
  protected readonly hasMore = signal(true); // Whether more Pokemon are available
  protected readonly isLoadingMore = signal(false); // Loading state for pagination


  /**
   * Computed property that returns either search results or all Pokemon
   */
  protected readonly displayedPokemon = computed(() => {
    const term = this.searchTerm();
    const search = this.searchResults();
    const all = this.allPokemon();
    
    console.log('displayedPokemon computed - term:', term, 'search results:', search.length, 'all:', all.length);
    
    return term.trim() ? search : all;
  });


  /**
   * Computed property to check if we're in search mode
   */
  protected readonly isInSearchMode = computed(() => {
    const searchTerm = this.searchControl.value;
    return !!(searchTerm && searchTerm.trim());
  });


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

  // Setup reactive search
  console.log('Setting up search subscription');
  
 this.searchControl.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        const searchTerm = term || '';
        console.log('Search triggered:', searchTerm);
        
        // Actualizar la signal del término de búsqueda
        this.searchTerm.set(searchTerm);
        
        if (!searchTerm.trim()) {
          this.isSearching.set(false);
          this.searchResults.set([]);
          return of({ count: 0, next: null, previous: null, results: [] });
        }
        
        this.isSearching.set(true);
        return this.service.searchPokemon(searchTerm);
      })
    ).subscribe({
      next: (data) => {
        console.log('Search results received:', data);
        
        if (data && data.results && Array.isArray(data.results)) {
          console.log('Setting results:', data.results.length);
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


  ngAfterViewInit() {
    if (!this.scrollSentinel?.nativeElement) return;

    const observer = new IntersectionObserver((entries) => {
      //only trigger infinite scroll when not in search mode
      if (entries[0].isIntersecting && !this.isInSearchMode()) {
        this.loadMorePokemon();
      }
    }, {
      threshold: 0.1
    });

    observer.observe(this.scrollSentinel.nativeElement);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  protected readonly isLoading = computed(() =>
    this.allPokemon().length === 0 && !this.isLoadingMore() && !this.isInSearchMode()
  );


  /**
  * Navigates to the Pokemon detail page for the given identifier.
  *
  * @param id Pokemon numeric ID or name string.
  */
  navigateToDetails(id: string | number) {
    this.router.navigateByUrl(`catalogo/${id}`);
  }

    /**
   * Clears the search and returns to normal catalog view
   */
  protected clearSearch() {
    this.searchControl.setValue('');
  }
}
