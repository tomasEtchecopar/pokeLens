import { Component, ElementRef, ViewChild } from '@angular/core';
import { PokemonService } from '../pokemon-service';
import { inject } from '@angular/core';
import { computed } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { effect } from '@angular/core';
import { Router } from '@angular/router';
import { PokemonCard } from '../pokemon-card/pokemon-card';
import { NamedAPIResource } from '../pokemon-models';
import { toSignal } from '@angular/core/rxjs-interop';
import { PokemonCatalogSearch } from './pokemon-catalog-search';
import { SearchBar } from "../../search-bar/search-bar";
import { PokemonCatalogPagination} from './pokemon-catalog-pagination';
import { AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-pokemon-catalog',
  imports: [PokemonCard, ReactiveFormsModule, SearchBar],
  templateUrl: './pokemon-catalog.html',
  styleUrl: './pokemon-catalog.css'
})
export class PokemonCatalog {

  private readonly service = inject(PokemonService); 
  private readonly router = inject(Router);
  private readonly pokemonSearch = inject(PokemonCatalogSearch);
  private readonly pagination = inject(PokemonCatalogPagination)

  protected readonly allPokemon = toSignal(this.service.getAllPokemon(), {initialValue : [] as NamedAPIResource[]});

  @ViewChild('scrollSentinel' ) scrollSentinel?: ElementRef<HTMLElement>; 

  protected readonly searchResults = this.pokemonSearch.results;

  protected readonly pokemonList = computed<NamedAPIResource[]>(() => {
    const search = this.searchResults();
    if(search && search.length >0){
      return search;
    }
    return this.allPokemon();
  });

  readonly displayedPokemon = this.pagination.displayedPokemon;

  protected readonly isLoading = computed(() =>
    this.allPokemon()?.length === 0 
  );


  constructor(){
    effect(() => {
      const list = this.allPokemon();
      if(list && list.length > 0){
        this.pagination.setPokemonList(list);
        this.pokemonSearch.setPokemonList(list);
      }
    })
  }

  navigateToDetails(id: string | number): void {
    this.router.navigateByUrl(`catalogo/${id}`);
  }

  onSearch(term: string){
    this.pokemonSearch.search(term)
    this.pagination.setPokemonList(this.pokemonSearch.results());
  }

 
  

}