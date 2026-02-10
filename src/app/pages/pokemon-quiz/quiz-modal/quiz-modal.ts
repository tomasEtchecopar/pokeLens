import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quiz-start-modal',
  standalone: true,
  templateUrl: './quiz-modal.html',
  styleUrl: './quiz-modal.css',
})
export class QuizStartModal {

  isOpen = input(false);
  start = output<void>();
  closed = output<void>();
  readonly router = inject(Router);

  // modal interno (reglas)
  readonly showRules = signal(false);

  onStart() {
    this.start.emit();
  }

  onClose() {
    this.showRules.set(false);
    this.closed.emit();
    this.router.navigateByUrl('/home');

  }

  openRules() {
    this.showRules.set(true);
  }

  closeRules() {
    this.showRules.set(false);
  }
}
