/** A named resource from the PokeAPI */
export interface NamedAPIResource {
    name: string; // Resource name
    url: string;  // Resource URL
}

/** A paginated list of named resources from the PokeAPI */
export interface NamedAPIResourceList {
    count: number;                   // Total resources
    next: string | null;             // Next page URL
    previous: string | null;         // Previous page URL
    results: NamedAPIResource[];     // Current page items
}


/** POKEMON */
export interface Pokemon {
    id: number;
    name: string;
    height: number; // decimetres
    weight: number; // hectograms
    base_experience: number;

    abilities: PokemonAbility[];
    forms: NamedAPIResource[];
    game_indices: PokemonGameIndex[];
    held_items: PokemonHeldItem[];
    location_area_encounters: string;
    sprites: PokemonSprites;
    species: NamedAPIResource;
    stats: PokemonStat[];
    types: PokemonType[];
}

export interface NamedAPIResource {
    name: string;
    url: string;
}

export interface PokemonAbility {
    ability: NamedAPIResource;
    is_hidden: boolean;
    slot: number;
}

export interface PokemonGameIndex {
    game_index: number;
    version: NamedAPIResource;
}

export interface PokemonHeldItem {
    item: NamedAPIResource;
    version_details: {
        rarity: number;
        version: NamedAPIResource;
    }[];
}

export interface PokemonMove {
    move: NamedAPIResource;
    version_group_details: {
        level_learned_at: number;
        move_learn_method: NamedAPIResource;
        version_group: NamedAPIResource;
    }[];
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