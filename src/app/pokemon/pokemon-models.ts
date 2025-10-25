/**
 * Represents a named resource from the PokeAPI.
 */
export interface NamedAPIResource {
    /** The name of the resource */
    name: string;
    /** The URL to fetch more details about the resource */
    url: string;
}

/**
 * Represents a paginated list of named resources from the PokeAPI.
 */
export interface NamedAPIResourceList {
    /** Total number of resources available */
    count: number;
    /** URL for the next page of results, null if none */
    next: string | null;
    /** URL for the previous page of results, null if none */
    previous: string | null;
    /** Array of named resources in this page */
    results: NamedAPIResource[];
}