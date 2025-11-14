import { pokemonVault } from "../pages/pokemon-collections/collection-model";

export interface User {
  id?: string ,
  username: string,
  age: number,
  mail: string,
  password: string,
  pokemonCatalogues?: pokemonVault[],
  pokemonTeams?: pokemonVault[]
  pokemonId?: number;
  avatarUrl?: string;
  points? : number;
  lastLoginDate? : string;
}
