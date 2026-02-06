import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-memory-win-modal',
  standalone: true,
  templateUrl: './memory-modal.html',
  styleUrl: './memory-modal.css',
})
export class MemoryWinModal {
  isOpen = input(false);

  moves = input(0);
  pointsAwarded = input<number | null>(null);

  // intentos restantes para sumar puntos hoy
  attemptsLeftToday = input<number | null>(null);

  closed = output<void>();
  restart = output<void>();

  onClose() {
    this.closed.emit();
  }

  onRestart() {
    this.restart.emit();
  }
}
