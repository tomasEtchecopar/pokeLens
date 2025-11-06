import { Component, inject, signal } from '@angular/core';
import { PokemonService } from '../../../pokemon/pokemon-service';
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Pokemon } from '../../../pokemon/models/pokemon-models';


@Component({
  selector: 'app-pokemon-collections',
  imports: [ReactiveFormsModule],
  templateUrl: './pokemon-collections.html',
  styleUrl: './pokemon-collections.css',
})
export class PokemonCollections {
  private readonly pkmService = inject(PokemonService);
  private readonly FormBuilder = inject(FormBuilder);

  protected readonly form = this.FormBuilder.nonNullable.group({
    name: ['', Validators.required]
  })

  searchPokemon(name: string){
    return this.pkmService.getPokemonByName(name);
  }

  addToCollection(array: Array<Pokemon>){
  }

  buildCollection(){
    const collection: Pokemon[] = [];
    const pkm = this.searchPokemon(this.form.getRawValue().name);

    pkm.forEach(value => {
      console.log(collection.push(value));
    })

    console.log(collection[0]);



  }

}
