import { Component, computed, inject, OnInit } from '@angular/core';
import { NgStyle, TitleCasePipe } from '@angular/common';
import { PokemonQuizService } from './pokemon-quiz-service';
import { AuthServ } from '../../core/auth.service';
import { NotificationService } from '../../core/notification.service';
import { AuthModal } from "../auth-modal/auth-modal";

@Component({
  selector: 'app-pokemon-quiz',
  standalone: true,
  imports: [TitleCasePipe, NgStyle, AuthModal],
  templateUrl: './pokemon-quiz.html',
  styleUrl: './pokemon-quiz.css'
})
export class PokemonQuiz implements OnInit {
  protected readonly quizService = inject(PokemonQuizService);
  private readonly auth = inject(AuthServ);
  private readonly notification = inject(NotificationService);

  protected readonly usuario = computed(() => this.auth.activeUser());

  ngOnInit(): void {
    // Solo generamos si no hay una pregunta activa (evita resets innecesarios)
    if (!this.quizService.currentQuestion()) {
      this.quizService.generateQuestion();
    }
  }

  selectAnswer(answer: string): void {
    this.quizService.validateAnswer(answer).subscribe(res => {
      const data = res?.data;
      if (!data) return;

      if (data.user) {
        this.auth.activeUser.set(data.user);
        localStorage.setItem('activeUser', JSON.stringify(data.user));
      }

      if (data.isCorrect) {
        if (data.pointsAwarded > 0) {
          this.notification.notify(`¡Correcto! +${data.pointsAwarded} puntos. Quedan ${data.remainingWithPoints} intentos.`);
        } else {
          this.notification.notify('¡Correcto! Límite de puntos diario alcanzado.');
        }
      }
    });
  }

  nextQuestion(): void {
    this.quizService.generateQuestion();
  }

 resetQuiz(): void {
  if (this.quizService.isValidating() || this.quizService.isLoading()) return;
  this.quizService.resetStats();
  this.quizService.generateQuestion();
}


  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  
}