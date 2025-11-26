import { Component, computed, inject, OnInit } from '@angular/core';
import { NgStyle, TitleCasePipe } from '@angular/common';
import { PokemonQuizService } from './pokemon-quiz-service';
import { AuthServ } from '../../core/auth.service';
import { PointsService } from '../../core/points.service';
import { PointEvent } from '../../user/user-model';
import { Router } from '@angular/router';

/**
 * PokemonQuiz component provides an interactive pokemon guessing game.
 * Awards points for correct answers and tracks user statistics.
 */
@Component({
  selector: 'app-pokemon-quiz',
  standalone: true,
  imports: [TitleCasePipe, NgStyle],
  templateUrl: './pokemon-quiz.html',
  styleUrl: './pokemon-quiz.css'
})
export class PokemonQuiz /* implements OnInit  */{
   protected readonly quizService = inject(PokemonQuizService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthServ);
  private readonly points = inject(PointsService);

  protected readonly usuario = computed(() => this.auth.activeUser());

  ngOnInit(): void {
    this.quizService.generateQuestion();
  }

  /**
   * Handles answer selection and awards points if correct.
   */
  selectAnswer(answer: string): void {
    this.quizService.checkAnswer(answer);
    if (this.quizService.isCorrect()) {
      this.awardPointsForCorrectAnswer();
    }
  }

  nextQuestion(): void {
    this.quizService.generateQuestion();
  }

  resetQuiz(): void {
    this.quizService.resetStats();
    this.quizService.generateQuestion();
  }

  // Returns image URL for display (can be extended for silhouette effect)
  getHiddenImage(imageUrl: string | null): string {
    if (!imageUrl) return '';
    return imageUrl;
  }

  /**
   * Awards +5 points for correct quiz answers.
   * Updates both points and history, then syncs with auth service and localStorage.
   */
  private awardPointsForCorrectAnswer(): void {
    const user = this.auth.activeUser();
    if (!user || !user.id) {
      return;
    }

    const amount = 5;
    const reason = 'Respuesta correcta en el Quiz Pokémon';
    const today = new Date();

    // Step 1: Add points
    this.points.addPoints(user, amount, reason).subscribe({
      next: (updatedUser) => {
        const event: PointEvent = {
          amount,
          reason,
          created_at: today.toISOString()
        };

        // Step 2: Add to history
        this.points.addHistory(updatedUser, event).subscribe({
          next: (finalUser) => {
            // Step 3: Sync with auth and localStorage
            this.auth.activeUser.set(finalUser);
            localStorage.setItem('activeUser', JSON.stringify(finalUser));

            // Step 4: Show alert with points
            alert(`¡Respuesta correcta! +${amount} puntos`);
          },
          error: () => {
            console.error('Error al registrar el historial de puntos');
          }
        });
      },
      error: () => {
        console.error('Error al sumar puntos por respuesta correcta');
      }
    });
  }

  goToLogin() {
    this.router.navigateByUrl('/logIn');
  }

  goToSignIn() {
    this.router.navigateByUrl('/signIn');
  }

  backToCatalog() {
    this.router.navigateByUrl('/catalog');
  }
}
