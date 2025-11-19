import { Component, effect, signal, input, output, inject } from '@angular/core';
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

  filtersOpen = signal(false);

  // Receives current filter state from parent
  currentFilters = input<FilterOptions>({});
  // Emits filter changes to parent
  filterUpdate = output<FilterOptions>();

  selectedType = signal('');
  selectedGeneration = signal('');
  selectedRegion = signal('');

  minHeight = signal<number | null>(null);
  maxHeight = signal<number | null>(null);
  minWeight = signal<number | null>(null);
  maxWeight = signal<number | null>(null);

  protected types = this.filtersTranslations.types;
  protected generations = this.filtersTranslations.generations;
  protected regions = this.filtersTranslations.regions;

  constructor() {
    effect(() => {
      const filters = this.currentFilters();
      if (filters) {
        // Converts API units (decimeters/hectograms) to display units (meters/kg)
        this.selectedType.set(filters.type || '');
        this.selectedGeneration.set(filters.generation || '');
        this.selectedRegion.set(filters.region || '');
        this.minHeight.set(filters.minHeight ? filters.minHeight * 10 : null);
        this.maxHeight.set(filters.maxHeight ? filters.maxHeight * 10 : null);
        this.minWeight.set(filters.minWeight ? filters.minWeight / 10 : null);
        this.maxWeight.set(filters.maxWeight ? filters.maxWeight / 10 : null);
      }
    });
  }

  toggleFilters() {
    this.filtersOpen.set(!this.filtersOpen());
  }

  private emit(): void {
    const filters: FilterOptions = {
      type: this.selectedType() as PokemonType || undefined,
      generation: this.selectedGeneration() as PokemonGeneration || undefined,
      region: this.selectedRegion() as PokemonRegion || undefined,
      minHeight: this.minHeight() != null ? this.minHeight()! / 10 : undefined,
      maxHeight: this.maxHeight() != null ? this.maxHeight()! / 10 : undefined,
      minWeight: this.minWeight() != null ? this.minWeight()! * 10 : undefined,
      maxWeight: this.maxWeight() != null ? this.maxWeight()! * 10 : undefined,
    };
    this.filterUpdate.emit(filters);
  }

  protected onChange(): void {
    console.log('changes detected; emitting...');
    this.emit();
  }

  /**
   * Resets all filters to default state and notifies parent.
   */
  clear(): void {
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
