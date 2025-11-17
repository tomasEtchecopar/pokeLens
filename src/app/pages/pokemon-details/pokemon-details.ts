import { Component, inject, linkedSignal } from '@angular/core';
import { computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe, NgClass, TitleCasePipe } from '@angular/common';
import { PokemonCard } from '../../pokemon/pokemon-card/pokemon-card';
import { toSignal } from '@angular/core/rxjs-interop';
import { effect } from '@angular/core';
import { PokeApiService } from '../../pokemon/pokeapi-service';
import { signal } from '@angular/core';
import { Pokemon } from '../../pokemon/models/pokemon-models';
import { translateGeneration, translateType } from '../../pokemon/models/pokemon-helpers';
import { forkJoin, switchMap } from 'rxjs';

@Component({
  selector: 'app-pokemon-details',
  imports: [TitleCasePipe, PokemonCard, DecimalPipe, NgClass, RouterLink],
  templateUrl: './pokemon-details.html',
  styleUrl: './pokemon-details.css'
})
export class PokemonDetails {
  private readonly service = inject(PokeApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly routeParams = toSignal(this.route.paramMap);
  private readonly pokemonName = computed(() => this.routeParams()?.get('name') ?? '');

  protected readonly pokemon = toSignal(this.route.paramMap.pipe(switchMap(params =>{
    const name = params.get('name');
    return this.service.getPokemon(name!);
  })));
  protected readonly isLoading = computed(() => this.pokemon() === undefined);

  //EVOLUTIONS
  protected readonly evolutionPokemons = signal<Pokemon[]>([]);
  protected readonly loadingEvolutions = signal(false);

  private readonly loadEvolutions = effect(() => {
    const p = this.pokemon();

    if (p?.evolution_line && p.evolution_line.length > 0) {
      this.loadingEvolutions.set(true);

      const evolution = p.evolution_line.map(name => this.service.getPokemon(name));

      forkJoin(evolution).subscribe({
        next: (evolutions) => {
          this.evolutionPokemons.set(evolutions);
          this.loadingEvolutions.set(false);
        },
        error: (error) => {
          console.error("error loading evolutions: ", error);
          this.loadingEvolutions.set(false);
        }
      })
    } else {
      this.evolutionPokemons.set([]);
    }
  })



  protected translateType = translateType;
  protected translateGeneration = translateGeneration;



}
