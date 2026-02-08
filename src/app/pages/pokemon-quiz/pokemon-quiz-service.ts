import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroment';
import { tap, catchError, of, finalize, delay } from 'rxjs';

import { ApiResponse } from '../../core/api-model';
import { QuizQuestion, QuizStats } from '../../pokemon/models/pokemon-quiz-model';

export type QuizValidateData = {
  isCorrect: boolean;
  correctAnswer?: string; // solo viene cuando erró (si el backend lo manda)
  pointsAwarded: number;
  pointsBlocked: boolean;
  correctToday: number;
  remainingWithPoints: number;
  user: any | null;
};
const SUSPENSE_PHRASES = [
  // Las que ya tenías
  '¿Será este…?',
  'La Pokédex está pensando…',
  'Procesando datos…',
  'Consultando al Profesor Oak…',
  'Esto es muy emocionante…',
  'El destino está echado…',
  'Analizando patrón Pokémon…',
  'La Pokébola tiembla…',
  '¡A ver si captura la respuesta!',
  'El Profesor Oak revisa sus notas…',
  'La Enciclopedia Pokémon se está actualizando…',
  'Los datos vienen desde Pueblo Paleta…',
  'El Centro Pokémon está confirmando el resultado…',
  'La Pokédex dice: “No te confíes”…',
  'Tu rival te observa en silencio…',
  '¡El combate mental está en curso!',
  'El destino de la Liga se decide ahora…',
  'La Torre Pokémon guarda el secreto…',
  'La Cueva Celeste lo sabe…',
  'Desde el Monte Moon llega una señal…',
  'La Ruta 1 murmura la respuesta…',
  'El Gimnasio está evaluando tu medalla…',
  'El Alto Mando está tomando nota…',
  'El Campeón espera tu jugada…',
  'Una brisa de Ciudad Lavanda trae pistas…',
  'El laboratorio está calibrando instrumentos…',
  '¡El PokéDex está escaneando el aura!',
  'El Profesor Elm también opina…',
  'La guardería Pokémon tiene un presentimiento…',
  'El intercambio se está completando…',
  '¡La suerte está usando “Doble Equipo”…!',
  'Aplicando “Pantalla Luz” a la duda…',
  'La respuesta usó “Protección”… ¿o no?',
  'Tu cerebro usó “Calma Mental”…',
  'La verdad está por usar “Revelación”…',
  'Los Unown están ordenando letras…',
  'El mapa del PokéNav se está cargando…',
  'Se oyen pasos en la hierba alta…',
  'Un Zubat pasó volando… mala señal ..',
  'El Team Rocket está interceptando la señal…',
  '¡No dejes que la duda use “Confusión”!',
  'La Pokédex casi lo tiene…',
  'Conectando con la PC de Bill…',
  'La guardia del Safari Zone está mirando…',
  'El Orbe está brillando…',
  'Una medalla se siente más cerca…',
  'La respuesta viene en camino… ¡aguantá!',
];


@Injectable({
  providedIn: 'root'
})
export class PokemonQuizService {
  // ===========================================================================
  // Dependencies
  // ===========================================================================
  private readonly http = inject(HttpClient);

  // ===========================================================================
  // Config
  // ===========================================================================
  private readonly apiUrl = `${environment.apiUrl}/quiz`;

  // ===========================================================================
  // Signals (state)
  // ===========================================================================
  /** Pregunta actual */
  readonly currentQuestion = signal<QuizQuestion | null>(null);

  /** Loading grande: solo para cargar una nueva pregunta */
  readonly isLoading = signal(false);

  /** Señal para elegir la frase de espera  */
  readonly suspenseText = signal<string>('');


  /** Validación en curso: se usa para evitar el "flash" y bloquear botones mientras valida */
  readonly isValidating = signal(false);

  /** Si el usuario ya respondió la pregunta actual */
  readonly hasAnswered = signal(false);

  /** Opción seleccionada por el usuario */
  readonly selectedAnswer = signal<string | null>(null);

  /** Resultado de la validación (null = todavía no validó) */
  readonly isCorrect = signal<boolean | null>(null);

  /** Respuesta completa del backend al validar */
  readonly lastValidation = signal<QuizValidateData | null>(null);

  /** Estadísticas locales del quiz */
  readonly stats = signal<QuizStats>({
    correct: 0,
    incorrect: 0,
    streak: 0,
    bestStreak: 0
  });

  // ===========================================================================
  // Computed
  // ===========================================================================
  readonly totalAnswered = computed(() => {
    const s = this.stats();
    return s.correct + s.incorrect;
  });

  readonly accuracy = computed(() => {
    const total = this.totalAnswered();
    if (total === 0) return 0;
    return Math.round((this.stats().correct / total) * 100);
  });

  // ===========================================================================
  // Public API (methods)
  // ===========================================================================

  /**
   * Carga una nueva pregunta desde el backend.
   * Usa isLoading (pantalla de carga grande).
   */
  generateQuestion(): void {
    // Reset de estado de la pregunta
    this.suspenseText.set('');
    this.hasAnswered.set(false);
    this.selectedAnswer.set(null);
    this.isCorrect.set(null);
    this.currentQuestion.set(null);
    this.lastValidation.set(null);

    // Importante: esto es "loading de pregunta"
    this.isLoading.set(true);

    this.http.get<ApiResponse<QuizQuestion>>(`${this.apiUrl}/question`).pipe(
      tap(response => {
        this.currentQuestion.set(response.data);

        // No loguear name si lo ocultás en backend (puede ser undefined)
        console.log('Quiz question loaded. Pokemon ID:', response.data?.pokemon?.id);
      }),
      catchError(err => {
        console.error('Error loading quiz question:', err);
        return of(null);
      }),
      finalize(() => {
        this.isLoading.set(false);
      })
    ).subscribe();
  }

  /**
   * Valida la respuesta en backend usando token.
   * Usa isValidating (no muestra pantalla de carga grande).
   *
   * Retorna un Observable para que el componente pueda:
   * - mostrar notificación
   * - sincronizar activeUser/localStorage si el backend devuelve el user actualizado
   */
  validateAnswer(answer: string) {
    // Evitar doble submit
    if (this.hasAnswered() || this.isValidating()) return of(null);

    const question = this.currentQuestion();
    if (!question) return of(null);

    // Feedback inmediato de UI
    this.selectedAnswer.set(answer);
    this.hasAnswered.set(true);
    this.isValidating.set(true);
    this.suspenseText.set(this.pickRandomSuspenseText());

    const payload = {
      token: question.token,
      userAnswer: String(answer).trim()
    };

    return this.http.post<ApiResponse<QuizValidateData>>(`${this.apiUrl}/validate`, payload).pipe(
      //agregamos un pequeño delay sumado al tiempo de respuesta de la API, 
      // para dar suspenso a la revelacion de la respuesta y se llegue a leer la frase aleatoria
      delay(700),
      tap(res => {
        const data = res.data;

        this.lastValidation.set(data);
        this.isCorrect.set(data.isCorrect);

        // Actualizar estadísticas locales
        const currentStats = this.stats();
        if (data.isCorrect) {
          this.stats.set({
            correct: currentStats.correct + 1,
            incorrect: currentStats.incorrect,
            streak: currentStats.streak + 1,
            bestStreak: Math.max(currentStats.streak + 1, currentStats.bestStreak)
          });
        } else {
          this.stats.set({
            correct: currentStats.correct,
            incorrect: currentStats.incorrect + 1,
            streak: 0,
            bestStreak: currentStats.bestStreak
          });
        }
      }),
      catchError(err => {
        console.error('Error validating answer:', err);

        // Si falla el backend, dejamos la UI en estado "respondido",
        // pero isCorrect quedará null (o lo podés setear en false si preferís).
        return of(null);
      }),
      finalize(() => {
        this.isValidating.set(false);
      })
    );
  }

  /** Reinicia estadísticas locales del quiz */
  resetStats(): void {
    this.stats.set({
      correct: 0,
      incorrect: 0,
      streak: 0,
      bestStreak: 0
    });
  }


  private suspenseBag: string[] = [];

  private pickRandomSuspenseText(): string {
    if (!this.suspenseBag.length) {
      // recargar y mezclar
      this.suspenseBag = [...SUSPENSE_PHRASES]
        .sort(() => Math.random() - 0.5);
    }

    return this.suspenseBag.pop()!;
  }




}
