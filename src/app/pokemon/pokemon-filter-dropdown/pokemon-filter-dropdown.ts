import { Component } from '@angular/core';
import { FilterOptions, PokemonGeneration, PokemonRegion, PokemonType } from '../models/pokemon-filters';
import { PokemonFiltersTranslation} from './pokemon-filters-translation';
import { inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { model } from '@angular/core';
import { output } from '@angular/core';

@Component({
  selector: 'app-pokemon-filter-dropdown',
  standalone:true,
  imports: [FormsModule],
  templateUrl: './pokemon-filter-dropdown.html',
  styleUrl: './pokemon-filter-dropdown.css',
})
export class PokemonFilterDropdown {
  private readonly filtersTranslations= inject(PokemonFiltersTranslation);
  filterUpdate= output<FilterOptions>();

selectedType = model<string>('');
  selectedGeneration = model<string>('');
  selectedRegion = model<string>('');
  minHeight = model<number | null>(null);
  maxHeight = model<number | null>(null);
  minWeight = model<number | null>(null);
  maxWeight = model<number | null>(null);

  protected types = this.filtersTranslations.types;
  protected generations = this.filtersTranslations.generations;
  protected regions = this.filtersTranslations.regions;

  private emit(){
    const filters: FilterOptions= {
      type: this.selectedType() as PokemonType || undefined,
      generation: this.selectedGeneration() as PokemonGeneration || undefined,
      region: this.selectedRegion() as PokemonRegion || undefined,
      minHeight: (this.minHeight() ?? undefined) !== undefined ? this.minHeight()! / 10 : undefined,
      maxHeight: (this.maxHeight() ?? undefined) !== undefined ? this.maxHeight()! / 10 : undefined,
      minWeight: (this.minWeight() ?? undefined) !== undefined ? this.minWeight()! * 10 : undefined,
      maxWeight: (this.maxWeight() ?? undefined) !== undefined ? this.maxWeight()! * 10 : undefined,
    };

    this.filterUpdate.emit(filters);
  }

  protected onChange = () => {
    console.log('changes detected; emitting...');
    this.emit();
  }

  clear(){
    this.selectedType.set('');
    this.selectedGeneration.set('');
    this.selectedRegion.set('');
    this.minHeight.set(null);
    this.maxHeight.set(null);
    this.minWeight.set(null);
    this.maxWeight.set(null);
    this.emit();
  }

}
