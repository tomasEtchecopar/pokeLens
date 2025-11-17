import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServ } from '../../core/auth.service';
import { UserClient } from '../../core/sign-in.service';
import { PokemonListService } from '../../pokemon/pokemon-list-service';
import { PokemonCard } from '../../pokemon/pokemon-card/pokemon-card';
import { Pokemon } from '../../pokemon/models/pokemon-models';



@Component({
  selector: 'app-user-collections',
  standalone: true,
  imports: [PokemonCard],
  templateUrl: './user-collections.html',
  styleUrl: './user-collections.css',
})
export class UserCollections {

  private readonly auth = inject(AuthServ);
  private readonly userClient = inject(UserClient);
  private readonly pkmList = inject(PokemonListService);
  private readonly router = inject(Router);

  editingIndex = signal<number | null>(null);
  editingName = signal<string>('');
  // Usuario activo
  usuario = computed(() => this.auth.activeUser());

  // Colecciones del usuario (pokemonVault[][])
  collections = computed(() => this.usuario()?.pokemonVault ?? []);

  // Promedio de poder por colección
  private readonly _collectionAverages = signal<number[]>([]);
  collectionAverages = computed(() => this._collectionAverages());

  constructor() {
    // Recalcula promedios cada vez que cambia el usuario / colecciones
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

        // Mapeo de entries del vault -> objetos Pokemon completos
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

  // Busca el Pokémon completo para la card
  getPokemonForCard(id: number | string | undefined): Pokemon | undefined {
    if (id == null) return undefined;
    const idNum = Number(id);
    const all = this.pkmList.allPokemon();
    return all.find(p => p.id === idNum);
  }

  // Eliminar 1 Pokémon de una colección
  deletePokemon(collectionIndex: number, arrayId: number) {
    const user = this.usuario();
    if (!user || !user.id) return;

    const vault = user.pokemonVault ?? [];
    if (collectionIndex < 0 || collectionIndex >= vault.length) return;

    const updatedCollection = vault[collectionIndex].filter(p => p.arrayId !== arrayId);
    const updatedVault = vault.map((col, i) =>
      i === collectionIndex ? updatedCollection : col
    );

    const updatedUser = { ...user, pokemonVault: updatedVault };

    this.userClient.updateUser(updatedUser, user.id).subscribe({
      next: (res) => {
        this.auth.activeUser.set(res);
        localStorage.setItem('activeUser', JSON.stringify(res));
      },
      error: () => alert('Error al eliminar el Pokémon de la colección'),
    });
  }

  // Eliminar TODA una colección
  deleteCollection(collectionIndex: number) {
    const user = this.usuario();
    if (!user || !user.id) return;

    if (!confirm('¿Seguro que querés eliminar toda esta colección?')) {
      return;
    }

    const vault = user.pokemonVault ?? [];
    const updatedVault = vault.filter((_, i) => i !== collectionIndex);
    const updatedUser = { ...user, pokemonVault: updatedVault };

    this.userClient.updateUser(updatedUser, user.id).subscribe({
      next: (res) => {
        this.auth.activeUser.set(res);
        localStorage.setItem('activeUser', JSON.stringify(res));
      },
      error: () => alert('Error al eliminar la colección'),
    });
  }

  getCollectionName(index: number): string {
    const user = this.usuario();
    const names = user?.collectionNames;
    const stored = names?.[index];

    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }

    // fallback si no tiene nombre
    return `Colección ${index + 1}`;
  }

  startEditingName(index: number) {
    const current = this.getCollectionName(index);
    this.editingIndex.set(index);
    this.editingName.set(current);
  }

  onNameInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.editingName.set(value);
  }

  saveCollectionName(index: number) {
    const user = this.usuario();
    if (!user || !user.id) {
      this.editingIndex.set(null);
      return;
    }

    const raw = this.editingName().trim();
    const finalName = raw || `Colección ${index + 1}`;

    const existing = user.collectionNames ?? [];
    const updatedNames = [...existing];
    updatedNames[index] = finalName;

    const updatedUser = {
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
        alert('Error al guardar el nombre de la colección');
        this.editingIndex.set(null);
      }
    });
  }

}
