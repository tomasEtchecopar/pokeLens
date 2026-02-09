import { Component, computed, effect, inject, signal } from '@angular/core';
import { PokemonService } from '../../pokemon/pokemon-service';
import { Pokemon } from '../../pokemon/models/pokemon-models';
import { MemoryCard } from '../../pokemon/models/memory-card-model';
import { AuthServ } from '../../core/auth.service';
import { AuthModal } from '../auth-modal/auth-modal';
import { BackgroundAudioService } from '../../core/background-audio.service';
import { MemoryWinModal } from './memory-modal/memory-modal';
import { environment } from '../../../enviroments/enviroment';

@Component({
  selector: 'app-memory-game',
  standalone: true,
  imports: [AuthModal, MemoryWinModal],
  templateUrl: './memory-game.html',
  styleUrl: './memory-game.css',
})
export class MemoryGame {
  /* ===== services ===== */
  private readonly auth = inject(AuthServ);
readonly audio = inject(BackgroundAudioService);

  private readonly baseUrl = `${environment.apiUrl}/memory`;

  /* ===== auth ===== */
  protected readonly usuario = computed(() => this.auth.activeUser());

  /* ===== board config ===== */
  readonly boards = [
    { cols: 4, rows: 3 }, // 12 cartas
    { cols: 6, rows: 3 }, // 18 cartas
  ] as const;
  private readonly MATCH_ANIM_MS = 2000;
  private readonly FAIL_ANIM_MS = 700;


  readonly board = signal<(typeof this.boards)[number]>(this.boards[0]);

  /* ===== start gate (autoplay policy) ===== */
  readonly showStartModal = signal(false);
  readonly gameStarted = signal(false);
  readonly showScoreModal = signal(false);

  /* ===== game state ===== */
  readonly cards = signal<MemoryCard[]>([]);
  readonly selected = signal<number[]>([]);
  readonly locked = signal(false);
  readonly moves = signal(0);

  // win control
  readonly showWinModal = signal(false);
  readonly winHandled = signal(false);
  readonly pointsAwarded = signal<number | null>(null);

  // intentos restantes para sumar puntos hoy
  readonly attemptsLeftToday = signal<number | null>(null);

  /* ===== computed ===== */
  readonly totalCards = computed(() => this.board().cols * this.board().rows);
  readonly pairs = computed(() => this.totalCards() / 2);
  readonly matches = computed(() => this.cards().filter(c => c.isMatched).length / 2);
  readonly isWin = computed(() => this.cards().length > 0 && this.cards().every(c => c.isMatched));

  constructor() {
    effect(() => {
      if (this.isWin() && !this.winHandled()) {
        this.winHandled.set(true);

        //cortar bgm y reproducir victoria una vez
        this.audio.playWin();

        //pedir puntos (y abrir modal cuando vuelve)
        this.awardPointsForWin();
      }
    });
  }

  /* ===== lifecycle ===== */
  ngOnInit() {
    if (this.usuario()) {
      this.showStartModal.set(true);
      this.gameStarted.set(false);
    }
  }

  ngOnDestroy() {
    this.audio.stopBackground();
  }

  /* ===== score modal ===== */
  openScoreModal() {
    this.showScoreModal.set(true);
  }

  closeScoreModal() {
    this.showScoreModal.set(false);
  }

  /* ===== start modal action ===== */
  startFromModal() {
    //este click habilita audio en producción
    this.showStartModal.set(false);
    this.gameStarted.set(true);

    this.audio.playBackground();
    this.startNewGame();
  }

  /* ===== board selection ===== */
  setBoard(b: (typeof this.boards)[number]) {
    this.board.set(b);

    // si todavía no arrancó, solo cambia tamaño
    if (!this.gameStarted()) return;

    this.startNewGame();
  }

  /* ===== game start ===== */
  startNewGame() {
    this.winHandled.set(false);
    this.pointsAwarded.set(null);
    this.attemptsLeftToday.set(null);
    this.showWinModal.set(false);

    this.cards.set([]);
    this.locked.set(true);
    this.selected.set([]);
    this.moves.set(0);

    if (this.gameStarted()) {
      this.audio.playBackground();
    }

    const limit = this.pairs();
    const token = localStorage.getItem('accessToken');

    fetch(`${this.baseUrl}/deck?limit=${limit}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) throw data;
        return data;
      })
      .then((resp) => {
        const pokemons = resp?.data?.pokemons ?? [];
        const deck = this.buildDeck(pokemons);
        this.cards.set(deck);
        this.locked.set(false);
      })
      .catch((e) => {
        console.error('Error loading memory deck', e);
        this.locked.set(false);
      });
  }

  /* ===== interaction ===== */
  onCardClick(index: number) {
    if (this.locked()) return;

    const card = this.cards()[index];
    if (!card || card.isMatched || card.isFlipped) return;
    if (this.selected().length >= 2) return;

    this.flip(index, true);

    const pick = [...this.selected(), index];
    this.selected.set(pick);

    if (pick.length === 2) {
      this.moves.update(m => m + 1);
      this.resolvePair(pick[0], pick[1]);
    }
  }

  /* ===== logic ===== */
  private resolvePair(a: number, b: number) {
    this.locked.set(true);

    const A = this.cards()[a];
    const B = this.cards()[b];
    const isMatch = A && B && A.key === B.key;

    if (isMatch) {
      this.audio.match();
      this.markMatched(a, b);
      this.selected.set([]);

      //NO desbloquear antes que termine la animación
      setTimeout(() => this.locked.set(false), this.MATCH_ANIM_MS);
      return;
    }

    this.audio.error();
    this.markError(a, b);

    setTimeout(() => {
      this.flip(a, false);
      this.flip(b, false);
      this.clearError(a, b);
      this.selected.set([]);
      this.locked.set(false);
    }, this.FAIL_ANIM_MS);

  }

  /* ===== helpers ===== */
  private flip(index: number, value: boolean) {
    this.cards.update(deck => {
      const copy = deck.slice();
      copy[index] = { ...copy[index], isFlipped: value };
      return copy;
    });
  }

  private markMatched(a: number, b: number) {
    this.cards.update(deck => {
      const copy = deck.slice();
      copy[a] = { ...copy[a], justMatched: true };
      copy[b] = { ...copy[b], justMatched: true };
      return copy;
    });

    setTimeout(() => {
      this.cards.update(deck => {
        const copy = deck.slice();
        copy[a] = { ...copy[a], isMatched: true, justMatched: false };
        copy[b] = { ...copy[b], isMatched: true, justMatched: false };
        return copy;
      });
    }, this.MATCH_ANIM_MS);
  }


  private markError(a: number, b: number) {
    this.cards.update(deck => {
      const copy = deck.slice();
      copy[a] = { ...copy[a], justError: true };
      copy[b] = { ...copy[b], justError: true };
      return copy;
    });
  }

  private clearError(a: number, b: number) {
    this.cards.update(deck => {
      const copy = deck.slice();
      copy[a] = { ...copy[a], justError: false };
      copy[b] = { ...copy[b], justError: false };
      return copy;
    });
  }

  /* ===== deck ===== */
  private buildDeck(pokemons: Pokemon[]): MemoryCard[] {
    const doubled = pokemons.flatMap(p => [
      this.makeCard(p, `${p.id}-a`),
      this.makeCard(p, `${p.id}-b`),
    ]);

    for (let i = doubled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
    }

    return doubled;
  }

  private makeCard(pokemon: Pokemon, uid: string): MemoryCard {
    return {
      uid,
      pokemon,
      key: pokemon.id,
      isFlipped: false,
      isMatched: false,
      justMatched: false,
      justError: false,
    };
  }

  /* ===== win modal actions ===== */
  closeWinModal() {
    this.showWinModal.set(false);
  }

  restartFromWin() {
    this.showWinModal.set(false);
    this.startNewGame();
  }

  /* ===== award points ===== */
  private awardPointsForWin() {
  const token = localStorage.getItem('accessToken'); // ✅ MISMA KEY que en deck

  // si no hay token, igual mostramos modal pero sin puntos
  if (!token) {
    this.pointsAwarded.set(null);
    this.attemptsLeftToday.set(null);
    this.showWinModal.set(true);
    return;
  }

  const b = this.board();

  fetch(`${this.baseUrl}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // ✅ ahora sí
    },
    body: JSON.stringify({
      cols: b.cols,
      rows: b.rows,
      moves: this.moves(),
    }),
  })
    .then(async (r) => {
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw { status: r.status, data }; // ✅ para ver status real
      return data;
    })
    .then((resp) => {
      const awarded = resp?.data?.pointsAwarded ?? null;
      this.pointsAwarded.set(awarded);

      const left = resp?.data?.attemptsLeftToday ?? null;
      this.attemptsLeftToday.set(left);

      const updatedUser = resp?.data?.user;
      if (updatedUser) {
        const current = this.auth.activeUser();
        this.auth.activeUser.set({ ...(current as any), ...updatedUser });
        localStorage.setItem('activeUser', JSON.stringify(this.auth.activeUser()));
      }

      this.showWinModal.set(true);
    })
    .catch((err) => {
      console.error('Error awarding memory points:', err);
      this.pointsAwarded.set(null);
      this.attemptsLeftToday.set(null);
      this.showWinModal.set(true);
    });
}

}
