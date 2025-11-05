import { inject, Injectable } from '@angular/core';
import { PokemonService } from '../pokemon-service';
import { translateGeneration, translateRegion, translateType } from '../models/pokemon-helpers';
import { map } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PokemonFiltersTranslation {
  private readonly service = inject(PokemonService);

  private readonly types = this.service.getTypes().pipe(
    map(types =>
      types
      .map(name => ({
        value: name,
        label: translateType(name)
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
    )
  );

  private readonly generations = this.service.getGenerations().pipe(
    map(generations =>
      generations
      .map(name =>({
        value: name,
        label: translateGeneration(name)
      }))
      .sort((a, b) => (a.label.localeCompare(b.label)))
    )
  );

  private readonly regions = this.service.getRegions().pipe(
    map(regions =>
      regions
      .map(name =>({
        value:name,
        label: translateRegion(name)
      }))
      .sort((a,b )=> (a.label.localeCompare(b.label)))
    )
  );
}
