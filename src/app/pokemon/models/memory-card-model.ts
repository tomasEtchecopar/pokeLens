import { Pokemon } from '../../pokemon/models/pokemon-models';

export interface MemoryCard {
  uid: String;
  pokemon: Pokemon;
  key: Number;
  isFlipped: Boolean;
  isMatched: Boolean;
  justMatched?: Boolean;
  justError?: Boolean;

}
