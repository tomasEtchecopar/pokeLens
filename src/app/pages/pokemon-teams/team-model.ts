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
