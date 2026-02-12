import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NgStyle, TitleCasePipe } from '@angular/common';
import { PokemonQuizService } from './pokemon-quiz-service';
import { AuthServ } from '../../core/auth.service';
import { NotificationService } from '../../core/notification.service';
import { AuthModal } from '../auth-modal/auth-modal';
import { QuizStartModal } from './quiz-modal/quiz-modal';
import { BackgroundAudioService } from '../../core/background-audio.service';
import { QUIZ_BGM_TRACKS } from './quiz-tracks';

@Component({
  selector: 'app-pokemon-quiz',
  standalone: true,
  imports: [TitleCasePipe, NgStyle, AuthModal, QuizStartModal],
  templateUrl: './pokemon-quiz.html',
  styleUrl: './pokemon-quiz.css',
})
export class PokemonQuiz implements OnInit, OnDestroy {
  protected readonly quizService = inject(PokemonQuizService);
  private readonly auth = inject(AuthServ);
  private readonly notification = inject(NotificationService);
  readonly audio = inject(BackgroundAudioService);

  protected readonly usuario = computed(() => this.auth.activeUser());

  // modal gate (autoplay)
  readonly showStartModal = signal(true);
  readonly gameStarted = signal(false);

  ngOnInit(): void {
    // Si no está logueado, mostramos el AuthModal y NO mostramos el start modal
    if (!this.usuario()) {
      this.showStartModal.set(false);
      this.gameStarted.set(false);
      return;
    }

    // Si está logueado, esperamos click en "Jugar" para audio + primera pregunta
    this.showStartModal.set(true);
    this.gameStarted.set(false);
  }

  ngOnDestroy(): void {
    this.audio.stopBackground?.();
  }

  startQuiz(): void {
    this.showStartModal.set(false);
    this.gameStarted.set(true);

    // tema random sin repetir hasta agotar
    this.audio.playBackgroundRandom(QUIZ_BGM_TRACKS);

    // primera pregunta
    this.quizService.generateQuestion();
  }

  closeStartModal(): void {
    this.showStartModal.set(false);
  }

  selectAnswer(answer: string): void {
    this.quizService.validateAnswer(answer).subscribe((res) => {
      const data = res?.data;
      if (!data) return;

      if (data.user) {
        this.auth.activeUser.set(data.user);
        localStorage.setItem('activeUser', JSON.stringify(data.user));
      }

      if (data.isCorrect) {
        if (data.pointsAwarded > 0) {
          this.notification.notify(
            `¡Correcto! +${data.pointsAwarded} puntos. Quedan ${data.remainingWithPoints} intentos.`
          );
        } else {
          this.notification.notify('¡Correcto! Límite de puntos diario alcanzado.');
        }
      }
    });
  }

  nextQuestion(): void {
    if (!this.gameStarted()) return;
    this.quizService.generateQuestion();
  }

  resetQuiz(): void {
    if (this.quizService.isValidating() || this.quizService.isLoading()) return;
    if (!this.gameStarted()) return;

    this.quizService.resetStats();
    this.quizService.generateQuestion();
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  // Slider de volumen 
  onVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    this.audio.setVolume(value);
  }
}
