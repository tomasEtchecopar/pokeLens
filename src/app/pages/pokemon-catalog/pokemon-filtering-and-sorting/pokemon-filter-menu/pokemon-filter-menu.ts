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
  selector: 'app-pokemon-filter-menu',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pokemon-filter-menu.html',
  styleUrl: './pokemon-filter-menu.css',
})
export class PokemonFilterMenu{
 private readonly filtersTranslations = inject(PokemonFiltersTranslation);

  @Input() currentFilters: FilterOptions = {};
  @Output() filterUpdate = new EventEmitter<FilterOptions>();

  filtersOpen = signal(false);

  selectedType = signal('');
  selectedGeneration = signal('');
  selectedRarity = signal('');
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
      this.selectedRarity.set((f as any).rarity || '');
      this.selectedRegion.set(f.region || '');
      this.minHeight.set(f.minHeight ? f.minHeight  /10 : null);
      this.maxHeight.set(f.maxHeight ? f.maxHeight/ 10: null);
      this.minWeight.set(f.minWeight ? f.minWeight / 10: null);
      this.maxWeight.set(f.maxWeight ? f.maxWeight / 10 : null);
    });
  }

  toggleFilters() {
    this.filtersOpen.update(v => !v);
  }

  onChange() {
    this.filterUpdate.emit({
      type: this.selectedType() as PokemonType|| undefined,
      rarity: this.selectedRarity() || undefined,
      generation: this.selectedGeneration() as PokemonGeneration|| undefined,
      region: this.selectedRegion() as PokemonRegion|| undefined,
      minHeight: this.minHeight() != null ? this.minHeight()! * 10 : undefined,
      maxHeight: this.maxHeight() != null ? this.maxHeight()! * 10 : undefined,
      minWeight: this.minWeight() != null ? this.minWeight()! * 10 : undefined,
      maxWeight: this.maxWeight() != null ? this.maxWeight()! * 10 : undefined,
    });
  }

  clear() {
    this.selectedType.set('');
    this.selectedRarity.set('');
    this.selectedGeneration.set('');
    this.selectedRegion.set('');
    this.minHeight.set(null);
    this.maxHeight.set(null);
    this.minWeight.set(null);
    this.maxWeight.set(null);
    this.filterUpdate.emit({});
  }
}
