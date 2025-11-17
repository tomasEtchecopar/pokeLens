import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { PokemonListService } from '../../pokemon/pokemon-list-service';
import { Pokemon } from '../../pokemon/models/pokemon-models';
import { UserClient } from '../../core/user-client.service';
import { pokemonVault } from './collection-model';

@Component({
  selector: 'app-pokemon-collections',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './pokemon-collections.html',
  styleUrl: './pokemon-collections.css',
})
export class PokemonCollections {
  private readonly pkmList = inject(PokemonListService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly userService = inject(UserClient);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    isMega: [false],
  });

  backToCatalog() {
    this.router.navigateByUrl('/catalogo');
  }

  checkMegaEvolved(allPokemon: Pokemon[]) {
    const { name, isMega } = this.form.getRawValue();

    if (!isMega) {
      return allPokemon.find(p => p.name === name);
    } else {
      // ojo: esto asume que el nombre de la mega en la API es "name-mega"
      return allPokemon.find(p => p.name === name.concat('-mega'));
    }
  }

  addCollection() {
    const allPokemon = this.pkmList.allPokemon();
    const pokemon = this.checkMegaEvolved(allPokemon);

    if (!pokemon) {
      alert('No se encontró el Pokémon seleccionado.');
      return;
    }

    const nuevo: pokemonVault = {
      arrayId: 0, // se pisará en el service con el nextId correcto
      idPokemon: pokemon.id,
      name: pokemon.name,
      moves: pokemon.moves?.map(m => m.move.name) || [],
      // si tu interfaz pokemonVault tiene más campos (nature, nickname, etc),
      // podés completarlos acá
    };

    // 👉 Colección 1 (si no existe, se crea sola en el servicio)
    const collectionNumber = 1;

    this.userService
      .addPokemonToVault('a7c8', nuevo, collectionNumber)
      .subscribe({
        next: () => console.log('✅ Pokémon agregado sin sobrescribir'),
        error: () => alert('Error al agregar el Pokémon a la colección'),
      });
  }
}
