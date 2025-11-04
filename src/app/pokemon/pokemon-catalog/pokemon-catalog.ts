import { AfterViewInit, Component, ElementRef, OnDestroy, untracked, ViewChild } from '@angular/core';
import { PokemonService } from '../pokemon-service';
import { Pokemon } from '../models/pokemon-models';
import { inject } from '@angular/core';
import { computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { effect } from '@angular/core';
import { Router } from '@angular/router';
import { PokemonCard } from '../pokemon-card/pokemon-card';
import { PokemonCatalogSearch } from './search/pokemon-catalog-search';
import { SearchBar } from "../../search-bar/search-bar";
import { PokemonCatalogPagination } from './pagination/pokemon-catalog-pagination';
import { PokemonFilterService } from './filter/pokemon-filter-service';

@Component({
  selector: 'app-pokemon-catalog',
  imports: [PokemonCard, ReactiveFormsModule, SearchBar],
  templateUrl: './pokemon-catalog.html',
  styleUrl: './pokemon-catalog.css'
})
export class PokemonCatalog implements AfterViewInit, OnDestroy{
  /**
   * Sets up infinite scroll
   */
  @ViewChild('scrollSentinel', {static: false} ) scrollSentinel?: ElementRef<HTMLElement>; 
  
  private readonly router = inject(Router);

  /**
   * This is where we get our pokemon list from
   */
  private readonly filtering = inject(PokemonFilterService);

  /**
   * This is where we perform searchs upon the list from the service above
   */
  private readonly pokemonSearch = inject(PokemonCatalogSearch);

  /**
   * Used to paginate pokemons to make use of infinite scroll
   */
  protected readonly pagination = inject(PokemonCatalogPagination)

  /**
   * List of pokemons to work from; already filtered
   */
  protected readonly allPokemon = this.filtering.filteredPokemon;

  /**
   * Search results from the list above; full list in case of no results
   */
  protected readonly pokemonList = this.pokemonSearch.results;

  /**
   * Boolean signal telling if the search has results
   */
  protected readonly hasSearchResults = this.pokemonSearch.hasResults;
  /**
   * Paginated list from the seach results
   */
  readonly displayedPokemon = this.pagination.displayedPokemon;

  protected readonly isLoading = computed(() =>
    this.allPokemon()?.length === 0 
  );

  //dont really know what its for but infinite scroll uses it
  private sentinelAttached = false;

  constructor(){
    effect(() => {
      const list = this.allPokemon();
      if(list && list.length) this.pokemonSearch.setPokemonList(list); //setting up search
      const searchResults = this.pokemonList();
      if(searchResults && searchResults.length){
        untracked(() => this.pagination.setPokemonList(list, 20)) //setting up pagination
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