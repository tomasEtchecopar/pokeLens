import { pokemonVault } from "../pages/pokemon-collections/collection-model";

export interface PointEvent {
  amount: number;
  reason: string;
  date: string;
}

export interface User {
  id?: string;
  username: string;
  age: number;
  mail: string;
  password: string;
  avatar_url?: string;
  points?: number;
  last_login_date?: string;
  last_created_collection?: string | null;
  pokemon_vault?: pokemonVault[][];
  collection_names?: string[];
  points_history?: PointEvent[];
  created_at?: string;
}
