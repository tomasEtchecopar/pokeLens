import { Component, effect, signal, Input, Output, inject } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { PokemonFiltersTranslation } from '../pokemon-filters-translation';
import { FilterOptions, PokemonGeneration, PokemonRegion, PokemonType } from '../../../../pokemon/models/pokemon-filters';
import { FormsModule } from '@angular/forms';

/**
 * PokemonFilterDropdown provides a UI for filtering pokemon by various criteria.
 * Handles unit conversions for height (decimeters) and weight (hectograms).
 */
@Component({
  selector: 'app-pokemon-filter-dropdown',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pokemon-filter-dropdown.html',
  styleUrl: './pokemon-filter-dropdown.css',
})
export class PokemonFilterDropdown {
 private readonly filtersTranslations = inject(PokemonFiltersTranslation);

  @Input() currentFilters: FilterOptions = {};
  @Output() filterUpdate = new EventEmitter<FilterOptions>();

  filtersOpen = signal(false);

  selectedType = signal('');
  selectedGeneration = signal('');
  selectedRegion = signal('');
  minHeight = signal<number | null>(null);
  maxHeight = signal<number | null>(null);
  minWeight = signal<number | null>(null);
  maxWeight = signal<number | null>(null);

  types = this.filtersTranslations.types;
  generations = this.filtersTranslations.generations;
  regions = this.filtersTranslations.regions;

  constructor() {
    effect(() => {
      const f = this.currentFilters;
      this.selectedType.set(f.type || '');
      this.selectedGeneration.set(f.generation || '');
      this.selectedRegion.set(f.region || '');
      this.minHeight.set(f.minHeight ?? null);
      this.maxHeight.set(f.maxHeight ?? null);
      this.minWeight.set(f.minWeight ?? null);
      this.maxWeight.set(f.maxWeight ?? null);
    });
  }

  toggleFilters() {
    this.filtersOpen.update(v => !v);
  }

  onChange() {
    this.filterUpdate.emit({
      type: this.selectedType() as PokemonType|| undefined,
      generation: this.selectedGeneration() as PokemonGeneration|| undefined,
      region: this.selectedRegion() as PokemonRegion|| undefined,
      minHeight: this.minHeight() ?? undefined,
      maxHeight: this.maxHeight() ?? undefined,
      minWeight: this.minWeight() ?? undefined,
      maxWeight: this.maxWeight() ?? undefined
    });
  }

  clear() {
    this.selectedType.set('');
    this.selectedGeneration.set('');
    this.selectedRegion.set('');
    this.minHeight.set(null);
    this.maxHeight.set(null);
    this.minWeight.set(null);
    this.maxWeight.set(null);
    this.filterUpdate.emit({});
  }
}
