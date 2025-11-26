import { inject, Injectable } from '@angular/core';
import { translateGeneration, translateRegion, translateType } from '../../../pokemon/models/pokemon-helpers';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { PokemonService } from '../../../pokemon/pokemon-service';


@Injectable({
  providedIn: 'root'
})
/**
 * service to translate filter names and map it to a label for ui use
 */
export class PokemonFiltersTranslation {
  private readonly service = inject(PokemonService);

  readonly types = toSignal(this.service.getTypes().pipe(
    map(types =>
      types
        .map(name => ({
          value: name,
          label: translateType(name)
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
    )
  ));

  readonly generations = toSignal(this.service.getGenerations().pipe(
    map(generations =>
      generations
        .map(name => ({
          value: name,
          label: translateGeneration(name)
        }))
        .sort((a, b) => (a.label.localeCompare(b.label)))
    )
  ));

  readonly regions = toSignal(this.service.getRegions().pipe(
    map(regions =>
      regions
        .map(name => ({
          value: name,
          label: translateRegion(name)
        }))
        .sort((a, b) => (a.label.localeCompare(b.label)))
    )
  ));
}
