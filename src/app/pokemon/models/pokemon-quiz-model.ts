import { Pokemon } from "./pokemon-models";
export interface QuizQuestion {
  pokemon: Pokemon;
  options: string[];
  correctAnswer: string;
}

export interface QuizStats {
  correct: number;
  incorrect: number;
  streak: number;
  bestStreak: number;
}
