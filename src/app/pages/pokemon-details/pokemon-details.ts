import { Component, inject} from '@angular/core';
import { PokemonFilterService } from '../pokemon-catalog/pokemon-filtering-and-sorting/pokemon-filter-service';
import { FilterOptions } from '../../pokemon/models/pokemon-filters';
import { computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe, NgClass, TitleCasePipe } from '@angular/common';
import { PokemonCard } from '../../pokemon/pokemon-card/pokemon-card';
import { toSignal } from '@angular/core/rxjs-interop';
import { effect } from '@angular/core';
import { signal } from '@angular/core';
import { Pokemon } from '../../pokemon/models/pokemon-models';
import { translateGeneration, translateType } from '../../pokemon/models/pokemon-helpers';
import { forkJoin, switchMap } from 'rxjs';
import { PokemonListService } from '../../pokemon/pokemon-list-service';

@Component({
  selector: 'app-pokemon-details',
  imports: [TitleCasePipe, PokemonCard, DecimalPipe, NgClass, RouterLink],
  templateUrl: './pokemon-details.html',
  styleUrl: './pokemon-details.css'
})
export class PokemonDetails {
  private readonly service = inject(PokemonListService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly filterService = inject(PokemonFilterService);
  private readonly routeParams = toSignal(this.route.paramMap);
  private readonly pokemonName = computed(() => this.routeParams()?.get('name') ?? '');

  protected readonly pokemon = toSignal(this.route.paramMap.pipe(switchMap(params =>{
    const name = params.get('name');
    return this.service.getPokemonByName(name!);
  })));
  protected readonly isLoading = computed(() => this.pokemon() === undefined);

  //EVOLUTIONS
  protected readonly evolutionPokemons = signal<Pokemon[]>([]);
  protected readonly loadingEvolutions = signal(false);

  private readonly loadEvolutions = effect(() => {
    const p = this.pokemon();

    if (p?.evolution_line && p.evolution_line.length > 0) {
      this.loadingEvolutions.set(true);

      const evolution = p.evolution_line.map(evo => {
    console.log('getting evolution:', evo.name)
    return this.service.getPokemonByName(evo.name);
  });

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



  private buildFilterForType(type?: string): FilterOptions {
  return {
    type: (type ?? undefined) as any,
    generation: undefined,
    region: undefined,
    minHeight: undefined,
    maxHeight: undefined,
    minWeight: undefined,
    maxWeight: undefined
  };
}

onTypeClick(ev: MouseEvent, typeName: string | undefined) {
  ev.stopPropagation();
  if (!typeName) return;

  const normalized = typeName.toString().toLowerCase(); // coincide con tus types
  const filters: FilterOptions = this.buildFilterForType(normalized);

  // reemplaza filtros (tal como hace tu API updateFilters)
  this.filterService.updateFilters(filters);

  // navegar al catálogo (sin query params)
  this.router.navigateByUrl('/catalog');
}

onRegionClick(ev: MouseEvent, region: string | undefined) {
  ev.stopPropagation();
  if (!region) return;

  const normalized = region.toString().toLowerCase();
  const filters: FilterOptions = {
    type: undefined,
    generation: undefined,
    region: normalized as any,
    minHeight: undefined,
    maxHeight: undefined,
    minWeight: undefined,
    maxWeight: undefined
  };

  this.filterService.updateFilters(filters);
  this.router.navigateByUrl('/catalog');
}

onGenerationClick(ev: MouseEvent, generation: string | number | undefined) {
  ev.stopPropagation();
  if (generation === undefined || generation === null) return;

  const normalized = generation.toString();
  const filters: FilterOptions = {
    type: undefined,
    generation: normalized as any,
    region: undefined,
    minHeight: undefined,
    maxHeight: undefined,
    minWeight: undefined,
    maxWeight: undefined
  };

  this.filterService.updateFilters(filters);
  this.router.navigateByUrl('/catalog');
}
}
