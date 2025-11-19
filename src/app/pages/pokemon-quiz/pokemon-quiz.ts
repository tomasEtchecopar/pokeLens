import { Component, computed, inject, OnInit } from '@angular/core';
import { NgStyle, TitleCasePipe } from '@angular/common';
import { PokemonQuizService } from './pokemon-quiz-service';
import { AuthServ } from '../../core/auth.service';
import { PointsService } from '../../core/points.service';
import { PointEvent } from '../../user/user-model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pokemon-quiz',
  standalone: true,
  imports: [TitleCasePipe, NgStyle],
  templateUrl: './pokemon-quiz.html',
  styleUrl: './pokemon-quiz.css'
})
export class PokemonQuiz implements OnInit {
  protected readonly quizService = inject(PokemonQuizService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthServ);
  private readonly points = inject(PointsService);
  protected readonly usuario = computed(() => this.auth.activeUser());


  ngOnInit(): void {
    this.quizService.generateQuestion();
  }

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

  // Obtiene la imagen ocultada (silueta)
  getHiddenImage(imageUrl: string | null): string {
    if (!imageUrl) return '';
    return imageUrl;
  }

  // Lógica para sumar puntos al usuario cuando acierta
  private awardPointsForCorrectAnswer(): void {
    const user = this.auth.activeUser();
    if (!user || !user.id) {
      return;
    }

    const amount = 5;
    const reason = 'Respuesta correcta en el Quiz Pokémon';

    const today = new Date();

    this.points.addPoints(user, amount, undefined, reason).subscribe({
      next: (updatedUser) => {
        const event: PointEvent = {
          amount,
          reason,
          date: today.toISOString()
        };

        this.points.addHistory(updatedUser, event).subscribe({
          next: (finalUser) => {
            this.auth.activeUser.set(finalUser);
            localStorage.setItem('activeUser', JSON.stringify(finalUser));
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
    this.router.navigateByUrl('/logIn');    // ajustá al path real de tu login
  }

  goToSignIn() {
    this.router.navigateByUrl('/signIn');  // ajustá si tu ruta es otra
  }

  backToCatalog() {
    this.router.navigateByUrl('/catalogo'); // ya la usás en otros lados
  }
}
