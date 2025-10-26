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