import { Component, inject, OnInit } from '@angular/core';
import { NgStyle, TitleCasePipe } from '@angular/common';
import { PokemonQuizService } from './pokemon-quiz-service';

@Component({
  selector: 'app-pokemon-quiz',
  standalone: true,
  imports: [TitleCasePipe, NgStyle],
  templateUrl: './pokemon-quiz.html',
  styleUrl: './pokemon-quiz.css'
})
export class PokemonQuiz implements OnInit {
  protected readonly quizService = inject(PokemonQuizService);

  ngOnInit(): void {
    this.quizService.generateQuestion();
  }

  selectAnswer(answer: string): void {
    this.quizService.checkAnswer(answer);
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
}
