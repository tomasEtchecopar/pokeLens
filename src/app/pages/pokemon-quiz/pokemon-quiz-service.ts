import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { QuizQuestion, QuizStats } from '../../pokemon/models/pokemon-quiz-model';
import { environment } from '../../../enviroments/enviroment';
import { tap, catchError, of } from 'rxjs';

interface QuizQuestionResponse {
  success: boolean;
  data: QuizQuestion;
}

@Injectable({
  providedIn: 'root'
})
export class PokemonQuizService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/quiz`;

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
   * Genera una nueva pregunta desde el backend
   */
  generateQuestion(): void {
    // Reset state
    this.hasAnswered.set(false);
    this.selectedAnswer.set(null);
    this.isCorrect.set(null);
    this.currentQuestion.set(null);
    this.isLoading.set(true);

    this.http.get<QuizQuestionResponse>(`${this.apiUrl}/question`).pipe(
      tap(response => {
        this.currentQuestion.set(response.data);
        console.log('Quiz question loaded:', response.data.pokemon.name);
      }),
      catchError(error => {
        console.error('Error loading quiz question:', error);
        // Reintentar después de 1 segundo
        setTimeout(() => this.generateQuestion(), 1000);
        return of(null);
      })
    ).subscribe(() => {
      this.isLoading.set(false);
    });
  }

  /**
   * Valida la respuesta del usuario
   */
  checkAnswer(answer: string): void {
    if (this.hasAnswered()) return;

    const question = this.currentQuestion();
    if (!question) return;

    this.selectedAnswer.set(answer);
    this.hasAnswered.set(true);

    const correct = answer === question.correctAnswer;
    this.isCorrect.set(correct);

    // Actualizar estadísticas locales
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

  resetStats(): void {
    this.stats.set({
      correct: 0,
      incorrect: 0,
      streak: 0,
      bestStreak: 0
    });
  }
}
