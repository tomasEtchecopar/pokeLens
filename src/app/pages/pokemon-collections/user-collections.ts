import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServ } from '../../core/auth.service';
import { PokemonListService } from '../../pokemon/pokemon-list-service';
import { UserClient } from '../../core/user-client.service';
import { PokemonCard } from '../../pokemon/pokemon-card/pokemon-card';
import { Pokemon } from '../../pokemon/models/pokemon-models';
import { User } from '../../user/user-model';
import { FormsModule } from '@angular/forms';

/**
 * UserCollections manages the users pokemon teams/vaults.
 * Handles team CRUD operations, nickname editing, and calculates average power stats.
 */
@Component({
  selector: 'app-user-collections',
  standalone: true,
  imports: [PokemonCard, FormsModule],
  templateUrl: './user-collections.html',
  styleUrl: './user-collections.css',
})
export class UserCollections {

  private readonly auth = inject(AuthServ);
  private readonly userClient = inject(UserClient);
  readonly pkmList = inject(PokemonListService);
  private readonly router = inject(Router);

  // Collection name editing state
  editingIndex = signal<number | null>(null);
  editingName = signal<string>('');

  usuario = computed(() => this.auth.activeUser());

  // User's pokemon teams (pokemonVault[][])
  collections = computed(() => this.usuario()?.pokemonVault ?? []);

  // Average power per collection
  private readonly _collectionAverages = signal<number[]>([]);
  collectionAverages = computed(() => this._collectionAverages());

  /**
   * Effect that reactively recalculates power averages whenever collections change.
   *
   * For each collection:
   * 1. Maps pokemonVault entries to full Pokemon objects
   * 2. Calculates total base stats for each pokemon
   * 3. Computes the average power for the collection
   * 4. Rounds to 2 decimal places
   */
  constructor() {
    effect(() => {
      const cols = this.collections();

      if (!cols || cols.length === 0) {
        this._collectionAverages.set([]);
        return;
      }

      const allPokemon = this.pkmList.allPokemon();
      const averages: number[] = [];

      cols.forEach(collection => {
        if (!collection || collection.length === 0) {
          averages.push(0);
          return;
        }

        // Convert vault entries to full Pokemon objects
        const pokemons: Pokemon[] = collection
          .map(entry => {
            if (entry.idPokemon == null) return undefined;
            const idNum = Number(entry.idPokemon);
            return allPokemon.find(p => p.id === idNum);
          })
          .filter((p): p is Pokemon => !!p);

        if (pokemons.length === 0) {
          averages.push(0);
          return;
        }

        // Calculate total base stats for each pokemon
        const powers = pokemons.map(pk =>
          (pk.stats ?? []).reduce((acc, s) => acc + (s.base_stat ?? 0), 0)
        );

        const sum = powers.reduce((a, b) => a + b, 0);
        const avg = sum / powers.length;

        averages.push(Number(avg.toFixed(2)));
      });

      this._collectionAverages.set(averages);
    });
  }

  backToProfile() {
    this.router.navigateByUrl('/profile');
  }

  /**
   * Removes a pokemon from a user's collection.
   * Updates backend, activeUser, and localStorage.
   */
  deletePokemon(collectionIndex: number, arrayId: number) {
    const user = this.usuario();
    if (!user || !user.id) return;

    if (confirm('Seguro que desea eliminar al Pokemon de la equipo?')) {
      const vault = user.pokemonVault ?? [];
      if (collectionIndex < 0 || collectionIndex >= vault.length) return;

      const updatedCollection = vault[collectionIndex].filter(p => p.arrayId !== arrayId);
      const updatedVault = vault.map((col, i) =>
        i === collectionIndex ? updatedCollection : col
      );

      const updatedUser: User = { ...user, pokemonVault: updatedVault };

      this.userClient.updateUser(updatedUser, user.id).subscribe({
        next: (res) => {
          this.auth.activeUser.set(res);
          localStorage.setItem('activeUser', JSON.stringify(res));
        },
        error: () => alert('Error al eliminar el Pokémon de la equipo'),
      });
    }
  }

  /**
   * Edits a pokemon's nickname within a collection.
   * Accepts nickname via parameter or prompts user if not provided.
   * Limits to 32 characters and removes empty nicknames.
   */
  editNickname(collectionIndex: number, arrayId: number, newNickname?: string) {
    const user = this.usuario();
    if (!user || !user.id) return;

    const vault = user.pokemonVault ?? [];
    if (collectionIndex < 0 || collectionIndex >= vault.length) return;

    const collection = vault[collectionIndex] ?? [];
    const entryIndex = collection.findIndex(e => e.arrayId === arrayId);
    if (entryIndex === -1) return;

    // Use provided nickname or prompt user
    let nickname: string | null | undefined = typeof newNickname === 'string'
      ? newNickname
      : prompt('Nuevo apodo para el Pokémon:', collection[entryIndex].nickname ?? '');

    if (nickname === null) return; // User cancelled

    nickname = (nickname ?? '').trim();
    if (nickname.length > 32) nickname = nickname.slice(0, 32);

    const finalNickname = nickname.length > 0 ? nickname : undefined;

    const updatedEntry = { ...collection[entryIndex], nickname: finalNickname };
    const updatedCollection = [...collection];
    updatedCollection[entryIndex] = updatedEntry;

    const updatedVault = vault.map((col, i) => (i === collectionIndex ? updatedCollection : col));

    const updatedUser: User = {
      ...user,
      pokemonVault: updatedVault
    };

    this.userClient.updateUser(updatedUser, user.id).subscribe({
      next: (res) => {
        this.auth.activeUser.set(res);
        localStorage.setItem('activeUser', JSON.stringify(res));
      },
      error: (err) => {
        console.error('Error al editar apodo', err);
        alert('Error al editar el apodo del Pokémon');
      }
    });
  }

  /**
   * Deletes an entire collection and its associated name.
   * Requires confirmation before deletion.
   */
  deleteCollection(index: number) {
    const user = this.usuario();
    if (!user || !user.id) return;

    const ok = confirm(`Seguro que queres eliminar la equipo ${index + 1}?`);
    if (!ok) return;

    const matrix = [...(user.pokemonVault ?? [])];
    matrix.splice(index, 1);

    const names = [...(user.collectionNames ?? [])];
    if (index < names.length) {
      names.splice(index, 1);
    }

    const updatedUser: User = {
      ...user,
      pokemonVault: matrix,
      collectionNames: names
    };

    this.userClient.updateUser(updatedUser, user.id).subscribe({
      next: (res) => {
        this.auth.activeUser.set(res);
        localStorage.setItem('activeUser', JSON.stringify(res));
      },
      error: (err) => {
        console.error('Error al borrar equipo', err);
        alert('Error al borrar la equipo');
      }
    });
  }

  /**
   * Returns the display name for a collection.
   * Falls back to "Equipo N" if no custom name exists.
   */
  getCollectionName(index: number): string {
    const user = this.usuario();
    const names = user?.collectionNames ?? [];
    const stored = names[index];

    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }
    return `Equipo ${index + 1}`;
  }

  startEditingName(index: number) {
    const current = this.getCollectionName(index);
    this.editingIndex.set(index);
    this.editingName.set(current);
  }

  /**
   * Saves a collection name on blur or Enter key.
   * Ensures collectionNames array matches vault length to prevent race conditions.
   * Uses generic names as fallback for empty inputs.
   */
  saveCollectionName(index: number) {
    const user = this.usuario();
    if (!user || !user.id) {
      this.editingIndex.set(null);
      return;
    }

    const data = this.editingName().trim();
    const finalName = data || `Equipo ${index + 1}`;

    const existing = user.collectionNames ?? [];
    const updatedNames = [...existing];

    // Ensure names array matches vault length to prevent sync issues
    if (updatedNames.length < this.collections().length) {
      for (let i = updatedNames.length; i < this.collections().length; i++) {
        if (!updatedNames[i]) {
          updatedNames[i] = `Equipo ${i + 1}`;
        }
      }
    }

    updatedNames[index] = finalName;

    const updatedUser: User = {
      ...user,
      collectionNames: updatedNames
    };

    this.userClient.updateUser(updatedUser, user.id).subscribe({
      next: (res) => {
        this.auth.activeUser.set(res);
        localStorage.setItem('activeUser', JSON.stringify(res));
        this.editingIndex.set(null);
      },
      error: () => {
        alert('Error al guardar el nombre de la equipo');
        this.editingIndex.set(null);
      }
    });
  }

  onNameInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.editingName.set(value);
  }

  goToCatalog() {
    this.router.navigateByUrl('/catalogo');
  }
}
