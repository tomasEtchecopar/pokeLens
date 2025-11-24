import { PokemonListService } from './../../pokemon/pokemon-list-service';
import { Injectable, signal, computed } from '@angular/core';
import { inject } from '@angular/core';
import { QuizQuestion, QuizStats } from '../../pokemon/models/pokemon-quiz-model';

/**
 * PokemonQuizService manages the pokemon guessing game.
 * Generates random questions, validates answers, and tracks user statistics.
 */
@Injectable({
  providedIn: 'root'
})
export class PokemonQuizService {
  private readonly pokeListService = inject(PokemonListService);

  readonly currentQuestion = signal<QuizQuestion | null>(null);
  readonly isLoading = signal(false);
  readonly hasAnswered = signal(false);
  readonly selectedAnswer = signal<string | null>(null);
  readonly isCorrect = signal<boolean | null>(null);

  readonly stats = signal<QuizStats>({
    correct: 0,
    incorrect: 0,
    streak: 0,
    bestStreak: 0
  });

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
   * Generates a new quiz question with 4 randomized options.
   * Tries to use cached pokemon first, falls back to API if needed.
   * Auto-retries if pokemon list is empty or if API fails.
   */
  generateQuestion(): void {
    // Reset state immediately to prevent stale data
    this.hasAnswered.set(false);
    this.selectedAnswer.set(null);
    this.isCorrect.set(null);
    this.currentQuestion.set(null);

    const allResources = this.pokeListService.allPokemonResource();

    if (allResources.length === 0) {
      console.error('No hay pokemon disponibles');
      setTimeout(() => this.generateQuestion(), 500);
      return;
    }

    this.isLoading.set(true);

    // Pick random correct answer
    const randomIndex = Math.floor(Math.random() * allResources.length);
    const correctPokemon = allResources[randomIndex];

    // Generate 3 unique incorrect options
    const incorrectOptions: string[] = [];
    while (incorrectOptions.length < 3) {
      const randomIdx = Math.floor(Math.random() * allResources.length);
      const name = allResources[randomIdx].name;

      if (name !== correctPokemon.name && !incorrectOptions.includes(name)) {
        incorrectOptions.push(name);
      }
    }

    const options = this.shuffleArray([
      correctPokemon.name,
      ...incorrectOptions
    ]);

    // Check cache first to avoid unnecessary API calls
    const allPokemon = this.pokeListService.allPokemon();
    const cachedPokemon = allPokemon.find(p => p.name === correctPokemon.name);

    if (cachedPokemon) {
      this.currentQuestion.set({
        pokemon: cachedPokemon,
        options,
        correctAnswer: correctPokemon.name
      });
      this.isLoading.set(false);
    } else {
      // Fetch from API if not cached
      this.pokeListService.getPokemonByName(correctPokemon.name).subscribe({
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
          // Retry with a different pokemon
          this.generateQuestion();
        }
      });
    }
  }

  /**
   * Validates the user's answer and updates stats accordingly.
   * Prevents multiple answers for the same question.
   */
  checkAnswer(answer: string): void {
    if (this.hasAnswered()) return;

    const question = this.currentQuestion();
    if (!question) return;

    this.selectedAnswer.set(answer);
    this.hasAnswered.set(true);

    const correct = answer === question.correctAnswer;
    this.isCorrect.set(correct);

    // Update statistics
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
        streak: 0, // Reset streak on wrong answer
        bestStreak: currentStats.bestStreak
      });
    }
  }

  resetStats(): void {
    this.stats.set({
      correct: 0,
      incorrect: 0,
      streak: 0,
      bestStreak: 0
    });
  }

  /**
   * Shuffles an array using Fisher-Yates algorithm.
   * Creates a copy to avoid mutating the original.
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
