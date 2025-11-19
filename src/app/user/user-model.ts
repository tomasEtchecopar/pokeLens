import { pokemonVault } from "../pages/profile/pokemon-collections/collection-model";

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
  pokemonId?: number;
  avatarUrl?: string;
  points?: number;
  lastLoginDate?: string;
  lastCreateCollection?: string | null;
  pokemonVault?: pokemonVault[][];
  collectionNames?: string[];
  pointsHistory?: PointEvent[];
}
