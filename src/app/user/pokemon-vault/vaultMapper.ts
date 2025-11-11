import { Pokemon } from "../../pokemon/models/pokemon-models";
import { pokemonVault } from "./pokemon-collections/collection-model";

export function mapPokemonToVault(pokemon: Pokemon): pokemonVault {
  return {
    idPokemon: pokemon.id,
    name: pokemon.name,
    moves: pokemon.moves?.map(m => m.move.name) ?? [],
    nature: undefined,
  };
}
