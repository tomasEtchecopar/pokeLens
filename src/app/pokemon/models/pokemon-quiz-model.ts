import { Pokemon } from "./pokemon-models";

export interface QuizQuestion {
  token: string;       // ✅ viene del backend (/quiz/question)
  pokemon: Pokemon;    // name es opcional, perfecto
  options: string[];
}

export interface QuizStats {
  correct: number;
  incorrect: number;
  streak: number;
  bestStreak: number;
}
