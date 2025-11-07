import { Injectable, signal } from '@angular/core';
import { NamedAPIResource } from '../pokemon-models';
import { computed } from '@angular/core';
import { NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PokemonCatalogPagination {
  private readonly pokemonList = signal<NamedAPIResource[]>([]);
  private readonly loadedPokemon = signal<NamedAPIResource[]>([])

  private pageSize = 20;

  private readonly offset = signal(0);
  private readonly hasMore = signal(true);
  private readonly isLoading = signal(false);

  //exposed signals
  readonly displayedPokemon = computed(() => this.loadedPokemon());
  readonly loading = computed(() => this.isLoading());
  readonly hasMoreAvailable = computed(() =>this.hasMore());
  
  private observer?: IntersectionObserver

  constructor(private readonly ngZone: NgZone){}

  setPokemonList(list: NamedAPIResource[], pageSize: number = 20): void{
    console.log("setting pagination list");
    this.pokemonList.set(list ?? []);
    this.pageSize = pageSize;

    this.offset.set(0);
    this.loadedPokemon.set([]);
    this.hasMore.set((list ?? []).length >0);
    this.loadMore();
  }

  loadMore(): void{
    if(this.isLoading() || !this.hasMore()) return;

    this.isLoading.set(true);

    setTimeout(() => {
    console.log("loadmoreifneeded");
    const list = this.pokemonList();
    const offset = this.offset();
    console.log(list as NamedAPIResource[]);

    if(offset>=list.length){
      this.hasMore.set(false);
      this.isLoading.set(false);
      return;
    }


    const nextChunk = list.slice(offset, offset + this.pageSize);
    console.log(nextChunk as NamedAPIResource[]);
    console.log(this.pageSize + offset);
    this.loadedPokemon.set([...this.loadedPokemon(), ...nextChunk]);
    this.offset.set(offset + nextChunk.length);
    this.hasMore.set(this.offset() < this.pokemonList().length);

    this.isLoading.set(false);
  }, 0);
}

  initScroll(sentinel: HTMLElement): void{
    this.ngZone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(entries => {
        for(const e of entries){
          if(e.isIntersecting){
            console.log("daojiadsjio");
            this.ngZone.run(() => this.loadMore());
          }
        }
      }, {root: null, rootMargin: '100px', threshold: 0.1});
      this.observer.observe(sentinel);
    })
  }

  disconnect(): void{
    this.observer?.disconnect();
  }
}
