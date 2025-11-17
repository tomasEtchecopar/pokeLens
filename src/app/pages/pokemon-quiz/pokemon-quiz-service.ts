import { PokemonListService } from './../../pokemon/pokemon-list-service';
import { Injectable, signal, computed } from '@angular/core';
import { inject } from '@angular/core';
import { Pokemon } from '../../pokemon/models/pokemon-models';
import { PokeApiService } from '../../pokemon/pokeapi-service';


export interface QuizQuestion {
  pokemon: Pokemon;
  options: string[];
  correctAnswer: string;
}

export interface QuizStats {
  correct: number;
  incorrect: number;
  streak: number;
  bestStreak: number;
}

@Injectable({
  providedIn: 'root'
})
export class PokemonQuizService {
  private readonly pokeListService = inject(PokemonListService);
  private readonly pokeApiService = inject(PokeApiService);

  // Estado del quiz
  readonly currentQuestion = signal<QuizQuestion | null>(null);
  readonly isLoading = signal(false);
  readonly hasAnswered = signal(false);
  readonly selectedAnswer = signal<string | null>(null);
  readonly isCorrect = signal<boolean | null>(null);

  // Estadísticas
  readonly stats = signal<QuizStats>({
    correct: 0,
    incorrect: 0,
    streak: 0,
    bestStreak: 0
  });

  // Computed
  readonly totalAnswered = computed(() => {
    const s = this.stats();
    return s.correct + s.incorrect;
  });

  readonly accuracy = computed(() => {
    const total = this.totalAnswered();
    if (total === 0) return 0;
    return Math.round((this.stats().correct / total) * 100);
  });

  /**
   * Genera una nueva pregunta del quiz
   */
  generateQuestion(): void {
    // Resetea el estado INMEDIATAMENTE
    this.hasAnswered.set(false);
    this.selectedAnswer.set(null);
    this.isCorrect.set(null);
    this.currentQuestion.set(null); // Limpia la pregunta anterior

    const allResources = this.pokeListService.allPokemonResource();

    if (allResources.length === 0) {
      console.error('No hay pokemon disponibles');
      setTimeout(() => this.generateQuestion(), 500); // Reintentar
      return;
    }

    this.isLoading.set(true);

    // Selecciona un pokemon aleatorio
    const randomIndex = Math.floor(Math.random() * allResources.length);
    const correctPokemon = allResources[randomIndex];

    // Genera 3 opciones incorrectas
    const incorrectOptions: string[] = [];
    while (incorrectOptions.length < 3) {
      const randomIdx = Math.floor(Math.random() * allResources.length);
      const name = allResources[randomIdx].name;

      if (name !== correctPokemon.name && !incorrectOptions.includes(name)) {
        incorrectOptions.push(name);
      }
    }

    // Mezcla las opciones
    const options = this.shuffleArray([
      correctPokemon.name,
      ...incorrectOptions
    ]);

    // Primero verifica si ya está cargado en la lista
    const allPokemon = this.pokeListService.allPokemon();
    const cachedPokemon = allPokemon.find(p => p.name === correctPokemon.name);

    if (cachedPokemon) {
      // Usa el pokemon del caché
      this.currentQuestion.set({
        pokemon: cachedPokemon,
        options,
        correctAnswer: correctPokemon.name
      });
      this.isLoading.set(false);
    } else {
      // Carga desde la API
      this.pokeApiService.getPokemon(correctPokemon.name).subscribe({
        next: (pokemon) => {
          this.currentQuestion.set({
            pokemon,
            options,
            correctAnswer: correctPokemon.name
          });
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error cargando pokemon:', error);
          this.isLoading.set(false);
          // Reintenta con otro pokemon
          this.generateQuestion();
        }
      });
    }
  }

  /**
   * Verifica la respuesta del usuario
   */
  checkAnswer(answer: string): void {
    if (this.hasAnswered()) return;

    const question = this.currentQuestion();
    if (!question) return;

    this.selectedAnswer.set(answer);
    this.hasAnswered.set(true);

    const correct = answer === question.correctAnswer;
    this.isCorrect.set(correct);

    // Actualiza estadísticas
    const currentStats = this.stats();
    if (correct) {
      this.stats.set({
        correct: currentStats.correct + 1,
        incorrect: currentStats.incorrect,
        streak: currentStats.streak + 1,
        bestStreak: Math.max(currentStats.streak + 1, currentStats.bestStreak)
      });
    } else {
      this.stats.set({
        correct: currentStats.correct,
        incorrect: currentStats.incorrect + 1,
        streak: 0,
        bestStreak: currentStats.bestStreak
      });
    }
  }

  /**
   * Reinicia las estadísticas
   */
  resetStats(): void {
    this.stats.set({
      correct: 0,
      incorrect: 0,
      streak: 0,
      bestStreak: 0
    });
  }

  /**
   * Mezcla un array (Fisher-Yates shuffle)
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
