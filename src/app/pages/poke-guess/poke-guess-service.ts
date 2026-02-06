import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroment';
import { ApiResponse } from '../../core/api-model';
import { map } from 'rxjs';

export interface LetterState{
  char: string;
  state: 'correct' | 'present' | 'absent' ;
}
export interface GuessHistoryItem {
  word: string;
  letterStates: LetterState[];
}

export interface GameInfo {
  letterCount: number;
  attempts: number;
  gameOver: boolean;
  won: boolean;
  guessHistory: GuessHistoryItem[];
}

export interface GuessResponse {
  correct: boolean;
  attempts: number;
  gameOver: boolean;
  won: boolean;
  letterStates: LetterState[];
  correctAnswer?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PokeGuessService {
  private apiUrl = `${environment.apiUrl}/pokeguess`;
  private http = inject(HttpClient);

 getGameInfo(){
    return this.http.get<ApiResponse<GameInfo>>(`${this.apiUrl}/info`).pipe(
      map(response => response.data)
    );
  }

  submitGuess(guess: string){
    return this.http.post<ApiResponse<GuessResponse>>(`${this.apiUrl}/guess`, { guess }).pipe(
      map(response => response.data)
    );
  }
}
