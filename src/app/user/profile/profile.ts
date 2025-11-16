import { Component, computed, effect, inject, signal } from '@angular/core';
import { AuthServ } from '../../core/auth.service';
import { Router } from '@angular/router';
import { SignIn } from '../sign-in/sign-in'; //Reutilizo el formulario de SignIn modificando OnSubmit
import { DatePipe } from '@angular/common';
import { PokeApiService } from '../../pokemon/pokeapi-service';
import { UserClient } from '../../core/user-client.service';
import { forkJoin } from 'rxjs';
import { PointsService } from '../../core/points.service';
import { PointEvent } from '../user-model';
import { toFormData } from 'axios';

@Component({
  selector: 'app-profile',
  imports: [SignIn, DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  readonly auth = inject(AuthServ);
  readonly user = inject(UserClient);
  readonly router = inject(Router);
  private readonly pokeService = inject(PokeApiService)
  private readonly points = inject(PointsService)

  usuario = computed(() => this.auth.activeUser());
  readonly isEditing = signal(false);
  history = signal<PointEvent[]>([]);

  constructor() {
    effect(() => {
      this.recalculateAveragePower();
      const u = this.usuario();
      if (u?.id) {
        this.loadHistory(u.id);
      }
    });
  }

  backToCatalog() { this.router.navigateByUrl('/catalogo'); }
  edit() { this.isEditing.set(true); }
  cancelEdit() { this.isEditing.set(false); }

  //Carga los ultimos 10 eventos donde el usuario sumo puntos
  loadHistory(id: string) {
    this.points.getHistory(id, 10).subscribe(history => {
      this.history.set(history);
    });
  }

  setDefaultAvatar(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'default.png';
  }

  pokemonArtworkUrl(id: number | string | undefined): string {
    return this.pokeService.pokemonArtworkUrl(id);
  }

  //Elimino pokemon de la coleccion.
  deletePokemon(arrayId: number) {
    const user = this.usuario();

    if (!user) return;

    const updatedVault = user.pokemonVault?.filter(p => p.arrayId !== arrayId) ?? [];

    const updatedUser = {
      ...user,
      pokemonVault: updatedVault
    };

    this.user.updateUser(updatedUser, user.id!).subscribe({
      next: (res) => {
        this.auth.activeUser.set(res);
        localStorage.setItem('activeUser', JSON.stringify(res));
        this.recalculateAveragePower();

      },
      error: () => alert("Error al eliminar el Pokémon")
    });
  }

  //Eliminar una coleccion
  clearCollection() {
    const user = this.usuario();

    if (!user) return;

    if (!confirm("¿Seguro que querés borrar toda la colección? Esto no se puede deshacer.")) {
      return;
    }

    const updatedUser = {
      ...user,
      pokemonVault: []
    };

    this.user.updateUser(updatedUser, user.id!).subscribe({
      next: (res) => {
        this.auth.activeUser.set(res);
        localStorage.setItem('activeUser', JSON.stringify(res));
        alert("Colección borrada con éxito");
      },
      error: () => alert("Error al borrar la colección")
    });
  }

  //Metodo para recalcular el poder de las colecciones al agregar o eliminar un pokemon
  /*
  /*  FALTARIA AGREGARLO AL AÑADIR UN POKEMON  */
  averagePower = signal<number>(0);

  recalculateAveragePower() {
    const user = this.usuario();
    if (!user || !user.pokemonVault?.length) {
      this.averagePower.set(0);
      return;
    }

    const requests = user.pokemonVault.map(p =>
      this.pokeService.getPokemon(String(p.idPokemon))
    );

    forkJoin(requests).subscribe(pokemons => {

      const powers = pokemons.map(pk =>
        this.pokeService.calcularPoder(pk.stats)
      );

      const sum = powers.reduce((acc, val) => acc + val, 0);
      const avg = sum / powers.length;

      this.averagePower.set(Number(avg.toFixed(2)));
    });
  }

  metodoPruebaSumarPuntos() {
    const today = new Date();
    const user = this.usuario();

    if (!user) {
      alert("No hay usuario logueado");
      return;
    }
    const points = this.points.randomPoints();

    this.points.addPoints(user, points, `Estamos probando, se otorgo ${points}`).subscribe(updatedUser => {

      const event: PointEvent = {
        amount: points,
        reason: "Estamos probando el sistema",
        date: today.toISOString()
      };

      this.points.addHistory(updatedUser, event).subscribe(finalUser => {
        this.auth.activeUser.set(finalUser);
        localStorage.setItem('activeUser', JSON.stringify(finalUser));
      });

    });
  }


}
