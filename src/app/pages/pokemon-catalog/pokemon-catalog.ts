import { AfterViewInit, Component, ElementRef, OnDestroy, signal, untracked, ViewChild } from '@angular/core';
import { inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchBar } from "./search-bar/search-bar";
import { PokemonCard } from '../../pokemon/pokemon-card/pokemon-card';
import { OnInit } from '@angular/core';
import { FilterOptions } from '../../pokemon/models/pokemon-filters';
import { PokemonFilterDropdown } from './pokemon-filtering-and-sorting/pokemon-filter-dropdown/pokemon-filter-dropdown';
import { PokemonSortMenu } from './pokemon-filtering-and-sorting/pokemon-sort-menu';
import { Pokemon } from '../../pokemon/models/pokemon-models';
import { NgZone } from '@angular/core';
import { PokemonService } from '../../pokemon/pokemon-service';
import { SortOption } from '../../pokemon/models/pokemon-sort';

@Component({
  selector: 'app-pokemon-catalog',
  imports: [ReactiveFormsModule, PokemonCard, SearchBar, PokemonFilterDropdown, PokemonSortMenu],
  templateUrl: './pokemon-catalog.html',
  styleUrl: './pokemon-catalog.css'
})
export class PokemonCatalog implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollSentinel', { static: false }) scrollSentinel?: ElementRef<HTMLElement>;
  private readonly pokemonService = inject(PokemonService);

  private chunkSize = 50;
  private offset = signal<number>(0);

  pokemons = signal<Pokemon[]>([]);

  isLoading = signal(false);
  hasMore = signal(true);

  search =signal<string>('');
  filters = signal<FilterOptions>({});
  sort = signal<SortOption>({key: 'id', dir: 'asc'});

   private observer?: IntersectionObserver;

    private sentinelAttached = false;

    constructor(private readonly ngZone: NgZone) { }

  ngOnInit(){
    console.log('Catalog ngOnInit: reset & load');
    this.resetAndLoad();
  }

    ngAfterViewInit(){
    setTimeout(() => {
      if (this.scrollSentinel?.nativeElement && !this.sentinelAttached) {
        console.log("initializing scroll")
        this.initScroll(this.scrollSentinel.nativeElement);
        this.sentinelAttached = true;
      } else {
        console.error('Sentinel not found');
      }
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

  ngOnDestroy() {
    this.observer?.disconnect();
  }


  onSearch(term: string) {
    console.log("search term: ", term);
    this.search.set(term);
    this.resetAndLoad();
  }


  applyFilters(filters: FilterOptions) {
    console.log("filters: ", filters);
    this.filters.set(filters || {});
    this.resetAndLoad();
  }

  onSort(sort: SortOption | null){
    console.log("updating sorting: ", sort);
    if(sort) this.sort.set(sort);
    else this.sort.set({ key: 'id', dir: 'asc' });
    this.resetAndLoad();
  }

  private resetAndLoad(){
    console.log('resetAndLoad: resetting state');
    this.offset.set(0);
    this.hasMore.set(true);
    this.pokemons.set([]);
    this.loadMore();
  }

  loadMore(){
    console.log('loadMore called — isLoading:', this.isLoading(), 'hasMore:', this.hasMore());
    if (this.isLoading() || !this.hasMore()) {
      console.log('not loading more');
      return;
    }
    this.isLoading.set(true);

        const payload = untracked(() => ({
      offset: this.offset(),
      limit: this.chunkSize,
      search: this.search(),
      filters: this.filters(),
      sort: this.sort()
    }));

    this.pokemonService.getPokemonChunk({
      offset: payload.offset,
      limit: payload.limit,
      search: payload.search, 
      filters: payload.filters,
      sort: payload.sort
    })
    .subscribe({
      next: (data) =>{
        console.log('chunk fetched size=', Array.isArray(data) ? data.length : 'unknown', data);

        // si la API devuelve estructura con data/hasMore, adaptá aquí.
        const received = data;
        this.pokemons.update(curr => [...curr, ...received]);

        if (received.length < this.chunkSize) {
          this.hasMore.set(false);
          console.log('no more data (received < chunkSize)');
        } else {
          this.offset.update(o => o + this.chunkSize);
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('chunk fetch error:', err);
        this.isLoading.set(false)
      },
    })
  }


}
