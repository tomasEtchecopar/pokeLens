import { AfterViewInit, Component, ElementRef, OnDestroy, signal, untracked, ViewChild } from '@angular/core';
import { inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchBar } from "./search-bar/search-bar";
import { PokemonCard } from '../../pokemon/pokemon-card/pokemon-card';
import { OnInit } from '@angular/core';
import { NavigationStart } from '@angular/router';
import { filter } from 'rxjs';
import { FilterOptions } from '../../pokemon/models/pokemon-filters';
import { PokemonSortMenu } from './pokemon-filtering-and-sorting/pokemon-sort-menu';
import { NgZone } from '@angular/core';
import { SortOption } from '../../pokemon/models/pokemon-sort';
import { PokemonFilterMenu } from './pokemon-filtering-and-sorting/pokemon-filter-menu/pokemon-filter-menu';
import { PokemonCatalogState } from './pokemon-catalog-state';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pokemon-catalog',
  imports: [ReactiveFormsModule, PokemonCard, SearchBar, PokemonFilterMenu, PokemonSortMenu],
  templateUrl: './pokemon-catalog.html',
  styleUrl: './pokemon-catalog.css'
})
export class PokemonCatalog implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollSentinel', { static: false }) scrollSentinel?: ElementRef<HTMLElement>;
  readonly catalogState = inject(PokemonCatalogState);
  private readonly ngZone = inject(NgZone);
  private readonly router = inject(Router);

  pokemons = this.catalogState.loadedPokemons.asReadonly();
  isLoading = this.catalogState.isLoading.asReadonly();
  hasMore = this.catalogState.hasMore.asReadonly();

   private observer?: IntersectionObserver;
    private sentinelAttached = false;
      private navigationSubscription?: any;


  ngOnInit(){
  // saves scroll when navigating FROM catalog to other route
    this.navigationSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe((event: NavigationStart) => {
        const currentUrl = this.router.url;
        const targetUrl = event.url;

        if (currentUrl.includes('/catalog') && targetUrl.includes('/details')) {
          const currentScroll = window.scrollY;
          console.log('leaving catalog - saving scroll:', currentScroll);
          this.catalogState.saveScrollPosition(currentScroll);
        } else {
          console.log('navigation event ignored:', { from: currentUrl, to: targetUrl });
        }
      });

    if (this.pokemons().length === 0 && this.catalogState.savedScrollPosition() === 0) {
      console.log('first load of catalog');
      this.catalogState.reset();
    } else {
      console.log('restoring saved state:', {
        pokemons: this.pokemons().length,
        scroll: this.catalogState.savedScrollPosition()
      });
    }
  }

    ngAfterViewInit(){
   if (this.scrollSentinel?.nativeElement && !this.sentinelAttached) {
      console.log("initializing scroll observer");
      this.initScroll(this.scrollSentinel.nativeElement);
      this.sentinelAttached = true;
    }

    const saved = this.catalogState.savedScrollPosition();
    if (saved > 0) {
      console.log('attempting to restore scroll to:', saved);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          console.log('restoring scroll now');
          window.scrollTo({
            top: saved,
            behavior: 'instant'
          });

          setTimeout(() => {
            const current = window.scrollY;
            console.log('scroll check - expected:', saved, 'actual:', current);

            if (Math.abs(current - saved) > 10) {
              console.log('retrying scroll restoration');
              window.scrollTo({
                top: saved,
                behavior: 'instant'
              });
            }
          }, 200);
        });
      });
    }
  }

  initScroll(sentinel: HTMLElement): void {
    this.ngZone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            console.log("Scroll limit reached");
            this.ngZone.run(() => this.catalogState.loadNextChunk());
          }
        }
      }, {
        root: null,
        rootMargin: '300px',
        threshold: 0.1
      });
      this.observer.observe(sentinel);
    });
  }

  ngOnDestroy() {
    const currentScroll = window.scrollY;
    if (currentScroll > 100) {
      console.log('ngOnDestroy backup - saving scroll:', currentScroll);
      this.catalogState.saveScrollPosition(currentScroll);
    }

    this.observer?.disconnect();
    this.navigationSubscription?.unsubscribe();
  }



  onSearch(term: string) {
    this.catalogState.setSearch(term);
  }


  applyFilters(filters: FilterOptions) {
    this.catalogState.setFilters(filters);
  }

  onSort(sort: SortOption | null){
    this.catalogState.setSort(sort ?? { key: 'id', dir: 'asc' });
  }

  hasActiveFiltersOrSearch(){
    const hasSearch = this.catalogState.search().length > 0;
    const filters = this.catalogState.filters();
    const hasFilters =
      (filters.type && (filters.type as any).length > 0) ||
      (filters.generation && (filters.generation as any).length > 0) ||
      (filters.region && (filters.region as any).length > 0) ||
      ((filters as any).rarity && String((filters as any).rarity).length > 0);
    return hasSearch || hasFilters;
  }

}
