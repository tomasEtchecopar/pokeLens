import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, of } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';
import { Pokemon } from '../models/pokemon-models';
import { inject } from '@angular/core';

interface DailyPokemonResponse {
  success: boolean;
  data: Pokemon;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class DailyPokemonService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/daily-pokemon`;

  private readonly _pokemonOfTheDay = signal<Pokemon | null>(null);
  private readonly _date = signal<string>('');
  readonly isLoading = signal(false);

  readonly pokemonOfTheDay = computed(() => this._pokemonOfTheDay());
  readonly date = computed(() => this._date());

  constructor() {
    // Carga automática al inicializar
    this.loadDailyPokemon();
  }

  /**
   * Carga el Pokémon del día desde el backend
   */
  loadDailyPokemon(): void {
    this.isLoading.set(true);

    this.http.get<DailyPokemonResponse>(this.apiUrl).pipe(
      tap(response => {
        this._pokemonOfTheDay.set(response.data);
        this._date.set(response.date);
        console.log(`Daily Pokémon loaded: ${response.data.name} (${response.date})`);
      }),
      catchError(error => {
        console.error('Error loading daily pokemon:', error);
        this._pokemonOfTheDay.set(null);
        return of(null);
      })
    ).subscribe(() => {
      this.isLoading.set(false);
    });
  }

  /**
   * Fuerza recarga del Pokémon del día
   */
  refresh(): void {
    this.loadDailyPokemon();
  }
}
