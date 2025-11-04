import { Component, EventEmitter, Output } from '@angular/core';
import { FilterType } from '../models/pokemon-filters';

@Component({
  selector: 'app-pokemon-filter-dropdown',
  imports: [],
  templateUrl: './pokemon-filter-dropdown.html',
  styleUrl: './pokemon-filter-dropdown.css',
})
export class PokemonFilterDropdown {
  @Output() filterChanged = new EventEmitter<FilterType>()

}
