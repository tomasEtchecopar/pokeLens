import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Pokemon } from '../../pokemon/models/pokemon-models';
//import { mapPokemonToVault } from '../vaultMapper';
import { map, Observable } from 'rxjs';
import { pokemonVault } from './collection-model';
import { PokemonListService } from '../../pokemon/pokemon-list-service';

@Component({
  selector: 'app-pokemon-collections',
  imports: [ReactiveFormsModule],
  templateUrl: './pokemon-collections.html',
  styleUrl: './pokemon-collections.css',
})
export class PokemonCollections {
  private readonly pkmService = inject(PokemonListService);
  private readonly FormBuilder = inject(FormBuilder);

  protected readonly form = this.FormBuilder.nonNullable.group({
    name: ['', Validators.required],
    isMega: [false]
  })

  addToCollection(){
    this.pkmService.allPokemon()

    /*if(!this.form.getRawValue().isMega){
      return this.pkmService.getPokemon(this.form.getRawValue().name);
    }else{
      return this.pkmService.getPokemon(this.form.getRawValue().name.concat('-mega'));
    }*/
  }

  buildCollection(){
    /*this.addToCollection().subscribe((pokemon: Pokemon) => {
      const vaultPokemon: pokemonVault = mapPokemonToVault(pokemon);

    })*/
  }

}
