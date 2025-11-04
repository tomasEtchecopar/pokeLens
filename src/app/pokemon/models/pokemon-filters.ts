export interface FilterType{
    type?: PokemonType;
    generation?: PokemonGeneration;
    region?: PokemonRegion;
    minHeight?: number;
    maxHeight?: number;
    mixWeight?: number;
    maxWeight?: number;
}

export interface FilterOption {
    value: string;
    label: string;
}

export type PokemonType
    = 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice' | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug' | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy'

export type PokemonGeneration =
    | 'generation-i' | 'generation-ii' | 'generation-iii' | 'generation-iv'
    | 'generation-v' | 'generation-vi' | 'generation-vii' | 'generation-viii'
    | 'generation-ix';

export type PokemonRegion =
    | 'kanto' | 'johto' | 'hoenn' | 'sinnoh' | 'unova'
    | 'kalos' | 'alola' | 'galar' | 'paldea';