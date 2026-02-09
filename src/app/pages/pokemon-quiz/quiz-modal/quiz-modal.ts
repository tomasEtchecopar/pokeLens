import { Component, input, output, signal } from '@angular/core';

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

  // modal interno (reglas)
  readonly showRules = signal(false);

  onStart() {
    this.start.emit();
  }

  onClose() {
    this.showRules.set(false);
    this.closed.emit();
  }

  openRules() {
    this.showRules.set(true);
  }

  closeRules() {
    this.showRules.set(false);
  }
}
