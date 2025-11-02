import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map } from 'rxjs';
import { signal, computed } from '@angular/core';
import { input, output } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search-bar',
  imports: [],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
/**
 * Generic search bar component
 */
export class SearchBar {
  /**
   * Detect changes on search form
   */
  readonly searchControl = new FormControl('', {nonNullable: true});

  /**
   * Input signal for placeholder text
   */
  placeholder = input<string>('Buscar...');


  /**
   * Search value
   */
  readonly searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(term => (term || '').trim())
    ),
    {initialValue: ''}
  )

  /**
   * Outputs the updated search value to the parent component
   */
  readonly searchUpdate = output<string>();

  constructor(){
    effect(() => {
      const term = this.searchTerm();
      this.searchUpdate.emit(term);
    })
  }

  readonly isSearching = signal(false);

  readonly isInSearchMode = computed(() => !!this.searchTerm().trim());

  clearSearch(): void{
    this.searchControl.setValue('');
  }
}