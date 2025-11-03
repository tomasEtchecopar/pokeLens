import { AfterViewInit, Component, ElementRef, OnDestroy, untracked, ViewChild } from '@angular/core';
import { PokemonService } from '../pokemon-service';
import { inject } from '@angular/core';
import { computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { effect } from '@angular/core';
import { Router } from '@angular/router';
import { PokemonCard } from '../pokemon-card/pokemon-card';
import { NamedAPIResource } from '../pokemon-models';
import { toSignal } from '@angular/core/rxjs-interop';
import { PokemonCatalogSearch } from './search/pokemon-catalog-search';
import { SearchBar } from "../../search-bar/search-bar";
import { PokemonCatalogPagination } from './pagination/pokemon-catalog-pagination';

@Component({
  selector: 'app-pokemon-catalog',
  imports: [PokemonCard, ReactiveFormsModule, SearchBar],
  templateUrl: './pokemon-catalog.html',
  styleUrl: './pokemon-catalog.css'
})
export class PokemonCatalog implements AfterViewInit, OnDestroy{

  private readonly service = inject(PokemonService); 
  private readonly router = inject(Router);
  private readonly pokemonSearch = inject(PokemonCatalogSearch);
  protected readonly pagination = inject(PokemonCatalogPagination)

  protected readonly allPokemon = toSignal(this.service.getAllPokemon(), {initialValue : [] as NamedAPIResource[]});

  @ViewChild('scrollSentinel', {static: false} ) scrollSentinel?: ElementRef<HTMLElement>; 

  protected readonly searchResults = this.pokemonSearch.results;
  protected readonly hasSearchResults = this.pokemonSearch.hasResults;

  protected readonly pokemonList = computed<NamedAPIResource[]>(() => {
    const search = this.searchResults();
    if(search && search.length >0){
      return search;
    }
    return this.allPokemon();
  });

  readonly displayedPokemon = this.pagination.displayedPokemon;

  protected readonly isLoading = computed(() =>
    this.allPokemon()?.length === 0 && this.pagination.loading()
  );

  private sentinelAttached = false;

  constructor(){
    effect(() => {
      const list = this.pokemonList();
      if(list && list.length > 0){
        untracked(() => {
        this.pagination.setPokemonList(list, 20);
        this.pokemonSearch.setPokemonList(this.allPokemon());
        })
      }
    })
  };

  ngAfterViewInit(): void{
    setTimeout(() => {
    if(this.scrollSentinel?.nativeElement && !this.sentinelAttached){
      console.log("initializing scroll")
      this.pagination.initScroll(this.scrollSentinel.nativeElement);
      this.sentinelAttached = true;
    } else{
      console.error('Sentinel not found');
    }
    }, 0);
  }

  ngOnDestroy(): void {
      this.pagination.disconnect();
  }

  navigateToDetails(id: string | number): void {
    this.router.navigateByUrl(`catalogo/${id}`);
  }
onSearch(term: string){
    this.pokemonSearch.search(term);
  }

}