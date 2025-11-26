import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { signal, computed } from '@angular/core';
import { input, output } from '@angular/core';
import { untracked } from '@angular/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
/**
 * Generic search bar component
 */
export class SearchBar {
  readonly searchControl = new FormControl('', { nonNullable: true });

  placeholder = input<string>('Buscar...');
  currentTerm = input<string>('');

  private isRestoringFromState = false;

  readonly searchUpdate = output<string>();

  readonly searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(
debounceTime(300),
      distinctUntilChanged(),
      map(term => term.trim())
    ),
    { initialValue: '' }
  )

  readonly isSearching = signal(false);
  readonly isInSearchMode = computed(() => !!this.searchTerm().trim());

  constructor() {
  // EFECTO 1: Restaura desde state sin emitir
    effect(() => {
      const external = this.currentTerm() ?? '';
      const current = this.searchControl.value.trim();

      if (external !== current) {
        this.isRestoringFromState = true;
        this.searchControl.setValue(external, { emitEvent: true }); // 👈 Ahora SÍ emite
        setTimeout(() => this.isRestoringFromState = false, 0);
      }
    });

    // EFECTO 2: Solo emite si NO estamos restaurando
    effect(() => {
      const term = this.searchTerm();
      if (!this.isRestoringFromState) {
        this.searchUpdate.emit(term);
      }
    });
  }



  clearSearch(): void {
    this.searchControl.setValue('');
  }
}
