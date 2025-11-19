import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServ } from '../../../core/auth.service';
import { UserClient } from '../../../core/sign-in.service';
import { PokemonListService } from '../../../pokemon/pokemon-list-service';
import { PokemonCard } from '../../../pokemon/pokemon-card/pokemon-card';
import { Pokemon } from '../../../pokemon/models/pokemon-models';
import { User } from '../../../user/user-model';
import { FormsModule } from '@angular/forms';
import { platformBrowser } from '@angular/platform-browser';

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

  // edición de nombre
  editingIndex = signal<number | null>(null);
  editingName = signal<string>('');

  // Usuario activo
  usuario = computed(() => this.auth.activeUser());

  // Equipos del usuario (pokemonVault[][])
  collections = computed(() => this.usuario()?.pokemonVault ?? []);

  // Promedio de poder por equipo
  private readonly _collectionAverages = signal<number[]>([]);
  collectionAverages = computed(() => this._collectionAverages());


  /**
   * Effect reactivo que recalcula los promedios de poder
   * cada vez que cambian las equipos del usuario.
   *
   * Este effect se ejecuta automáticamente cuando:
   * - this.collections() cambia (cuando el usuario agrega/borra pokémon)
   * - o cuando se setea un usuario activo nuevo
   *
   * El objetivo es llenar this._collectionAverages con
   * un array de números donde:
   *    collectionAverages[i] = promedio de poder de la equipo i
   */
  constructor() {
    // Recalcula promedios cada vez que cambian las equipos
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

        /**
       * Convierte cada entrada de la equipo (pokemonVault) en un objeto Pokemon real.
       * Para eso:
       * - toma el idPokemon
       * - lo busca en allPokemon
       * - filtra los que no se encuentren
       */
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
        // Suma total de todos los poderes del equipo
        const sum = powers.reduce((a, b) => a + b, 0);
        const avg = sum / powers.length;

        // Se agrega el promedio redondeado a 2 decimales
        averages.push(Number(avg.toFixed(2)));
      });
      // Actualiza la señal con todos los promedios calculados
      this._collectionAverages.set(averages);
    });
  }

  backToProfile() {
    this.router.navigateByUrl('/profile');
  }


  /**
   * Elimina un Pokemon de una equipo del usuario.
   *
   * @param collectionIndex Numero de la equipo dentro de pokemonVault (indice del array)
   * @param arrayId Identificador unico del Pokemon dentro de esa equipo
   *
   * Flujo:
   * 1. Verifica que exista usuario y tenga id.
   * 2. Valida que la equipo exista.
   * 3. Filtra el Pokemon a eliminar usando su arrayId.
   * 4. Reconstruye el pokemonVault con la equipo actualizada.
   * 5. Persiste el usuario actualizado en el backend (updateUser).
   * 6. Actualiza activeUser y localStorage.
   */
  deletePokemon(collectionIndex: number, arrayId: number) {
    const user = this.usuario();
    if (!user || !user.id) return;

    if(confirm('Seguro que desea eliminar al Pokemon de la equipo?')){
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

editNickname(collectionIndex: number, arrayId: number, newNickname?: string) {
  const user = this.usuario();
  if (!user || !user.id) return;

  const vault = user.pokemonVault ?? [];
  if (collectionIndex < 0 || collectionIndex >= vault.length) return;

  const collection = vault[collectionIndex] ?? [];
  const entryIndex = collection.findIndex(e => e.arrayId === arrayId);
  if (entryIndex === -1) return;

  // Obtener apodo: si viene por parámetro lo usamos, si no pedimos con prompt()
  let nickname: string | null | undefined = typeof newNickname === 'string'
    ? newNickname
    : prompt('Nuevo apodo para el Pokémon:', collection[entryIndex].nickname ?? '');

  // Si el usuario canceló el prompt, termina sin cambios
  if (nickname === null) return;

  // Limpiar y validar
  nickname = (nickname ?? '').trim();
  if (nickname.length > 32) nickname = nickname.slice(0, 32); // límite razonable

  // Si quedó vacío, lo removemos (undefined) para mantener consistencia
  const finalNickname = nickname.length > 0 ? nickname : undefined;

  // Construir equipo actualizada (no mutamos objetos originales)
  const updatedEntry = { ...collection[entryIndex], nickname: finalNickname };
  const updatedCollection = [...collection];
  updatedCollection[entryIndex] = updatedEntry;

  // Reconstruir el vault completo
  const updatedVault = vault.map((col, i) => (i === collectionIndex ? updatedCollection : col));

  const updatedUser: User = {
    ...user,
    pokemonVault: updatedVault
  };

  // Persistir en backend y actualizar activeUser / localStorage
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
   * Elimina una equipo completa del usuario.
   *
   * @param index Numero de la equipo dentro de pokemonVault (indice del array)
   *
   * Flujo:
   * 1. Verifica que exista usuario y tenga id.
   * 2. Pide confirmacion antes de borrar.
   * 3. Quita la equipo del array pokemonVault.
   * 4. Quita tambien el nombre correspondiente en collectionNames.
   * 5. Genera un usuario actualizado con esos cambios.
   * 6. Persiste el usuario en el backend.
   * 7. Actualiza activeUser y localStorage.
   */
  deleteCollection(index: number) {
    const user = this.usuario();
    if (!user || !user.id) return;

    const ok = confirm(`Seguro que queres eliminar la equipo ${index + 1}?`);
    if (!ok) return;

    // Copia del vault actual. Elimina la equipo por indice.
    const matrix = [...(user.pokemonVault ?? [])];
    matrix.splice(index, 1);

    // Copia de los nombres. Si existe un nombre para esa equipo, tambien se elimina.
    const names = [...(user.collectionNames ?? [])];
    if (index < names.length) {
      names.splice(index, 1);
    }

    // Usuario actualizado con ambas modificaciones
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


  // Nombre visible de la equipo i
  getCollectionName(index: number): string {
    const user = this.usuario();
    const names = user?.collectionNames ?? [];
    const stored = names[index];

    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }
    return `Equipo ${index + 1}`;
  }

  // Empieza edición
  startEditingName(index: number) {
    const current = this.getCollectionName(index);
    this.editingIndex.set(index);
    this.editingName.set(current);
  }

  /**
   * Guarda el nombre de una equipo.
   *
   * Se ejecuta cuando el input pierde el foco (blur) o cuando el usuario
   * toca Enter en el campo de edicion del nombre.
   *
   * @param index Indice de la equipo que se esta editando.
   *
   * Flujo:
   * 1. Verifica que haya usuario y que tenga id.
   * 2. Toma el texto ingresado y lo limpia de espacios.
   * 3. Si queda vacio, usa un nombre por defecto.
   * 4. Obtiene los nombres existentes y se asegura de que tengan el largo correcto.
   * 5. Reemplaza el nombre en el indice correspondiente.
   * 6. Persiste el usuario con updateUser.
   * 7. Actualiza activeUser y localStorage.
   * 8. Sale del modo edicion.
   */
  saveCollectionName(index: number) {
    const user = this.usuario();
    if (!user || !user.id) {
      this.editingIndex.set(null);
      return;
    }
    // Texto ingresado en el input de nombre
    const data = this.editingName().trim();

    // Si quedo vacio, usamos un nombre generico
    const finalName = data || `Equipo ${index + 1}`;

    // Nombres actuales (puede venir undefined)
    const existing = user.collectionNames ?? [];

    // Creamos un nuevo array para no mutar el anterior
    const updatedNames = [...existing];

    /**
     *Con este metodo aseguramos que si hay carrera de tiempos entre componentes,
     *la equipo tenga al menos un nombre generico
     *ya que el array de nombres esta directamente relacionado con cada array interno del Vaul[]
     */
    if (updatedNames.length < this.collections().length) {
      for (let i = updatedNames.length; i < this.collections().length; i++) {
        if (!updatedNames[i]) {
          updatedNames[i] = `Equipo ${i + 1}`;
        }
      }
    }

    // Reemplaza o asigna el nombre en el indice deseado
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
