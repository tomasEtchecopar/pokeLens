import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { PokemonListService } from '../../pokemon/pokemon-list-service';
import { Router } from '@angular/router';
import { pokemonVault } from './collection-model';
import { Pokemon } from '../../pokemon/models/pokemon-models';
import { UserClient } from '../../core/user-client.service';
import { User } from '../../user/user-model';



@Component({
  selector: 'app-pokemon-collections',
  imports: [ReactiveFormsModule],
  templateUrl: './pokemon-collections.html',
  styleUrl: './pokemon-collections.css',
})
export class PokemonCollections {
  private readonly pkmList = inject(PokemonListService);
  private readonly FormBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly userService = inject(UserClient)

  protected readonly form = this.FormBuilder.nonNullable.group({
    name: ['', Validators.required],
    isMega: [false]
  })

  backToCatalog() {
    this.router.navigateByUrl('/catalogo');
  }

  checkMegaEvolved(allPokemon: Pokemon[]){
      if(!this.form.getRawValue().isMega){
        return allPokemon.find(p => p.name == this.form.getRawValue().name);
      }else{
        return allPokemon.find(p => p.name == this.form.getRawValue().name.concat("-mega"));
      }
  }

  addCollection() {
    const allPokemon = this.pkmList.allPokemon();

    this.userService.getUserById("a7c8").subscribe((usuario: User) => {
      const vaultedPkm: pokemonVault[] = usuario.pokemonVault ?? []; // Initializes the array if it's not already initialized in the json

      const nextId = vaultedPkm.length ? Math.max(...vaultedPkm.map(p => p.arrayId)) + 1 : 1; // Calculates the next ID based on the maximum length of the array


      const pokemon = this.checkMegaEvolved(allPokemon); // Checks if the User selected that it is a mega evolved pokemon (needs more security for a pokemon without a mega)

      this.userService.addPokemonToVault("a7c8", {
        arrayId: nextId,
        idPokemon: pokemon?.id,
        name: pokemon?.name,
        moves: pokemon?.moves?.map(m => m.move.name) || []
      }).subscribe(() => console.log('✅ Pokémon agregado sin sobrescribir'));

    });
  }
}
