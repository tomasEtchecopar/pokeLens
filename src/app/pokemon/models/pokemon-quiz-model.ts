import { Pokemon } from "./pokemon-models";

export type QuizQuestion = {
  token: string;
  options: string[];
  pokemon: {
    sprites: {
      front_default?: string | null;
    };
  };
};


export interface QuizStats {
  correct: number;
  incorrect: number;
  streak: number;
  bestStreak: number;
}