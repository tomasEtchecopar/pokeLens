import { Injectable, signal } from '@angular/core';
import { Pokemon } from '../../pokemon/models/pokemon-models';
import { PokemonService } from '../../pokemon/pokemon-service';
import { inject } from '@angular/core';
import { FilterOptions } from '../../pokemon/models/pokemon-filters';
import { untracked } from '@angular/core';
import { SortOption } from '../../pokemon/models/pokemon-sort';

@Injectable({
  providedIn: 'root'
})
export class PokemonCatalogState {
  private readonly pokemonService = inject(PokemonService);

  private readonly chunkSize = 50;

  search = signal<string>('');
  filters = signal<FilterOptions>({});
  sort = signal<SortOption>({key: 'id', dir: 'asc'});

  loadedPokemons = signal<Pokemon[]>([])
  offset = signal<number>(0);
  hasMore = signal<boolean>(true);
  isLoading = signal<boolean>(false);
  savedScrollPosition = signal<number>(0);

   resetAndClearScroll() {
    this.loadedPokemons.set([]);
    this.offset.set(0);
    this.hasMore.set(true);
    this.savedScrollPosition.set(0);
    this.loadNextChunk();
  }
  reset(){
    this.loadedPokemons.set([]);
    this.offset.set(0);
    this.hasMore.set(true);
    this.loadNextChunk();
  }

  setSearch(term: string) {
    if (this.search() === term) return;
    this.search.set(term);
    this.resetAndClearScroll();
  }

  setFilters(filters: FilterOptions) {
    this.filters.set(filters);
    this.resetAndClearScroll();
  }

  setSort(sort: SortOption) {
    this.sort.set(sort);
    this.resetAndClearScroll();
  }

  clear(){
    this.search.set('');
    this.filters.set({});
    this.sort.set({key: 'id', dir: 'asc'});
    this.resetAndClearScroll();
  }
    saveScrollPosition(position: number) {
    this.savedScrollPosition.set(position);
  }

  loadNextChunk() {
    if (this.isLoading() || !this.hasMore()) return;

    this.isLoading.set(true);

    const payload = untracked(() => ({
      offset: this.offset(),
      limit: this.chunkSize,
      search: this.search(),
      filters: this.filters(),
      sort: this.sort()
    }));

    this.pokemonService.getPokemonChunk(payload).subscribe({
      next: (received) => {
        untracked(() => {
          this.loadedPokemons.update(curr => [...curr, ...received]);

          if (received.length < this.chunkSize) {
            this.hasMore.set(false);
          } else {
            this.offset.update(o => o + this.chunkSize);
          }

          this.isLoading.set(false);
        });
      },
      error: (err) => {
        console.error('chunk fetch error:', err);
        this.isLoading.set(false);
      }
    });
  }

}
