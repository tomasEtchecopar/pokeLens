import { Injectable, signal } from '@angular/core';
import { NamedAPIResource } from '../pokemon-models';
import { computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PokmeonCatalogPagination {
  private readonly pokemonList = signal<NamedAPIResource[]>([]);
  private readonly loadedPokemon = signal<NamedAPIResource[]>([])

  private pageSize = 20;

  private readonly offset = signal(0);
  private readonly hasMore = signal(true);

  readonly displayedPokemon = computed(() => this.loadedPokemon());
  readonly isLoading = signal(false);

  setPokemonList(list: NamedAPIResource[], pageSize: number = 20): void{
    this.pokemonList.set(list ?? []);
    this.pageSize = pageSize;

    this.offset.set(0);
    this.loadedPokemon.set([]);
    this.hasMore.set(list.length>0);
    this.loadMoreIfNeeded();
  }

  loadMoreIfNeeded(): void{
    if(!this.hasMore()) return;

    const list = this.pokemonList();
    const offset = this.offset();

    if(offset>=list.length){
      this.hasMore.set(false);
      return;
    }

    this.isLoading.set(true);

    const nextChunk = list.slice(offset, offset + this.pageSize);
    this.loadedPokemon.set([...this.loadedPokemon(), ...nextChunk]);
    this.offset.set(offset + nextChunk.length);
    this.hasMore.set(this.offset() < this.pokemonList.length);

    this.isLoading.set(false);
  }
}
