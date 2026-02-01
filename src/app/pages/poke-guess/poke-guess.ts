// src/app/components/pokeguess/pokeguess.component.ts
import { Component, OnInit, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokeGuessService, GuessHistoryItem, LetterState } from './poke-guess-service';
import { AuthServ } from '../../core/auth.service';
import { PointsService } from '../../core/points.service';
import { NotificationService } from '../../core/notification.service';
import { AuthModal } from '../auth-modal/auth-modal';
import { PointEvent } from '../../user/user-model';

interface TileState extends LetterState {
  revealed: boolean;
}

@Component({
  selector: 'app-pokeguess',
  standalone: true,
  imports: [CommonModule, AuthModal],
  templateUrl: './poke-guess.html',
  styleUrls: ['./poke-guess.css']
})
export class PokeGuess implements OnInit {
private pokeguessService = inject(PokeGuessService);
private auth = inject(AuthServ);
private points = inject(PointsService);
private notification = inject(NotificationService);

protected readonly usuario = computed(() => this.auth.activeUser());

  letterCount = signal<number>(0);
  currentGuess = signal<string>('');
  guessHistory = signal<GuessHistoryItem[]>([]);
  attempts = signal<number>(0);
  gameOver = signal<boolean>(false);
  won = signal<boolean>(false);
  message = signal<string>('');
  loading = signal<boolean>(false);
  shake = signal<boolean>(false);
  correctAnswer = signal<string>('');
  isMobile = signal<boolean>(false);

  maxAttempts = 6;

  rows = computed(() => {
    const history = this.guessHistory();
    const current = this.currentGuess();
    const letterCount = this.letterCount();
    const gameOver = this.gameOver();

    if (letterCount === 0) return [];

    const rows: Array<Array<TileState>> = [];

    if (history && Array.isArray(history)) {
      history.forEach(item => {
        if (item && item.letterStates && Array.isArray(item.letterStates)) {
          const tiles: TileState[] = item.letterStates.map(ls => ({
            char: ls.char || '',
            state: ls.state || 'absent',
            revealed: true
          }));
          rows.push(tiles);
        }
      });
    }

    if (!gameOver && letterCount > 0) {
      const currentTiles: TileState[] = [];
      for (let i = 0; i < letterCount; i++) {
        currentTiles.push({
          char: i < current.length ? current[i].toUpperCase() : '',
          state: 'absent',
          revealed: false
        });
      }
      rows.push(currentTiles);
    }

    const emptyRowsCount = this.maxAttempts - rows.length;
    for (let i = 0; i < emptyRowsCount; i++) {
      const emptyTiles: TileState[] = [];
      for (let j = 0; j < letterCount; j++) {
        emptyTiles.push({
          char: '',
          state: 'absent',
          revealed: false
        });
      }
      rows.push(emptyTiles);
    }

    return rows;
  });

  keyboard = computed(() => {
    const rows = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
      ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
    ];

    const letterStates = new Map<string, 'correct' | 'present' | 'absent'>();
    const history = this.guessHistory();

    if (history && Array.isArray(history)) {
      history.forEach(item => {
        if (item && item.letterStates && Array.isArray(item.letterStates)) {
          item.letterStates.forEach(ls => {
            if (ls && ls.char) {
              const current = letterStates.get(ls.char);
              if (!current ||
                  (current === 'absent' && ls.state !== 'absent') ||
                  (current === 'present' && ls.state === 'correct')) {
                letterStates.set(ls.char, ls.state);
              }
            }
          });
        }
      });
    }

    return rows.map(row =>
      row.map(key => ({
        key,
        state: letterStates.get(key) || 'unused'
      }))
    );
  });

  ngOnInit() {
    this.checkIfMobile();
    this.loadGameInfo();
  }

  checkIfMobile() {
    this.isMobile.set(window.innerWidth <= 768);
  }

  @HostListener('window:resize')
  onResize() {
    this.checkIfMobile();
  }

  loadGameInfo() {
    this.pokeguessService.getGameInfo().subscribe({
      next: (info) => {
        console.log('Game info received:', info);
        this.letterCount.set(info.letterCount || 0);
        this.attempts.set(info.attempts || 0);
        this.gameOver.set(info.gameOver || false);
        this.won.set(info.won || false);
        this.guessHistory.set(info.guessHistory || []);

        if (info.gameOver) {
          this.message.set(info.won ? '¡Ganaste!' : 'Intenta mañana');
        }
      },
      error: (err) => {
        console.error('Error loading game info:', err);
        this.message.set('Error al cargar el juego');
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (this.gameOver() || this.loading() || this.letterCount() === 0) return;

    const key = event.key.toUpperCase();

    if (key === 'ENTER') {
      event.preventDefault();
      this.submitGuess();
    } else if (key === 'BACKSPACE') {
      event.preventDefault();
      this.handleBackspace();
    } else if (/^[A-ZÑ]$/.test(key)) {
      event.preventDefault();
      this.handleLetter(key);
    }
  }

  handleLetter(letter: string) {
    if (this.currentGuess().length < this.letterCount()) {
      this.currentGuess.update(g => g + letter);
    }
  }

  handleBackspace() {
    this.currentGuess.update(g => g.slice(0, -1));
  }

  onKeyClick(key: string) {
    if (this.gameOver() || this.loading()) return;

    if (key === 'ENTER') {
      this.submitGuess();
    } else if (key === 'BACK') {
      this.handleBackspace();
    } else {
      this.handleLetter(key);
    }
  }

  submitGuess() {
    const guess = this.currentGuess();

    if (guess.length !== this.letterCount()) {
      this.shake.set(true);
      this.message.set(`Debe tener ${this.letterCount()} letras`);
      setTimeout(() => {
        this.shake.set(false);
        this.message.set('');
      }, 600);
      return;
    }

    this.loading.set(true);
    this.message.set('');

    this.pokeguessService.submitGuess(guess.toLowerCase()).subscribe({
      next: (response) => {
        console.log('Guess response:', response);

        this.guessHistory.update(history => [
          ...history,
          { word: guess, letterStates: response.letterStates }
        ]);

        this.attempts.set(response.attempts);
        this.gameOver.set(response.gameOver);
        this.won.set(response.won);

        if (response.correct) {
          this.message.set('¡Correcto! ');
          this.awardPointsForCorrectAnswer()
        } else if (response.gameOver) {
          this.message.set(`Era: ${response.correctAnswer?.toUpperCase()}`);
          this.correctAnswer.set(response.correctAnswer || '');
        } else {
          this.message.set('');
        }

        this.currentGuess.set('');
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error submitting guess:', err);
        const errorMsg = err.error?.error || 'Error al verificar';
        this.message.set(errorMsg);
        this.shake.set(true);
        setTimeout(() => {
          this.shake.set(false);
        }, 600);
        this.loading.set(false);
      }
    });
  }
  private awardPointsForCorrectAnswer(): void {
    const user = this.auth.activeUser();
    if (!user || !user.id) {
      return;
    }

    const amount = 20;
    const reason = 'Respuesta correcta en PokeGuess';
    const today = new Date();

    // Step 1: Add points
    this.points.addPoints(user, amount, reason).subscribe({
      next: (updatedUser) => {
        const event: PointEvent= {
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

            // Step 4: Show notification with points
            this.notification.notify(`¡Respuesta correcta! +${amount} puntos`);
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
}
