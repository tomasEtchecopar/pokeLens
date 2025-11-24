import { pokemonVault } from "../pages/pokemon-teams/team-model";

export interface PointEvent {
  id?: string,
  amount: number;
  reason: string;
  created_at: string;
}

export interface User {
  id?: string;
  username: string;
  mail: string;
  password: string;
  age: number;
  points?: number;
  avatar_url?: string;
  login_dates: string[]; // Array de fechas
  last_team_created_at?: string | null;
  created_at?: string;
}


// Nuevas interfaces
export interface Team {
  id: string;
  name: string;
  position: number;
  pokemons: TeamPokemon[];
  created_at?: string;
}

export interface TeamPokemon {
  id: string;
  pokemon_id: number;
  nickname?: string | null;
  position: number;
  captured_at?: string;
}
