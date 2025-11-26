export interface NamedAPIResource {
    name: string; // Resource name
    url: string;  // Resource URL
}

export interface APIResource{
  url: string;
}

export interface NamedAPIResourceList {
    count: number;
    next: string | null;
    previous: string | null;
    results: NamedAPIResource[];
}


export interface Pokemon {
    id: number;
    name: string;
    height: number; // decimetres
    weight: number; // hectograms
    base_experience: number;
    rarity?: 'common' | 'rare' | 'epic' | 'legendary' | string;
    cries?: PokemonCries;
    abilities: PokemonAbility[];
    sprites: PokemonSprites;
    stats: PokemonStat[];
    types: PokemonType[];
    generation?: string;
    region?: string;
    evolution_line?: TemporaryEvolutionType[];
}

export interface TemporaryEvolutionType{ //will delete once evolutions are correctly representated on database
  id: string;
  name: string;
}


export interface PokemonAbility {
    ability: NamedAPIResource;
    is_hidden: boolean;
    slot: number;
}


export interface PokemonSprites {
    front_default: string | null;
    back_default: string | null;
    front_shiny: string | null;
    back_shiny: string | null
}

export interface PokemonStat {
    base_stat: number;
    effort: number;
    stat: NamedAPIResource;
}

export interface PokemonType {
    slot: number;
    type: NamedAPIResource;
}

export interface PokemonCries{
  latest: string;
  legacy: string;
}
