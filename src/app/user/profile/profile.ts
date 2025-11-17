import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import { AuthServ } from '../../core/auth.service';
import { PointsService } from '../../core/points.service';
import { PointEvent } from '../user-model';
import { SignIn } from '../sign-in/sign-in';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [SignIn, DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  private readonly auth = inject(AuthServ);
  private readonly router = inject(Router);
  private readonly points = inject(PointsService);

  usuario = computed(() => this.auth.activeUser());
  readonly isEditing = signal(false);
  history = signal<PointEvent[]>([]);

  constructor() {
    effect(() => {
      const u = this.usuario();
      if (u?.id) {
        this.loadHistory(u.id);
      }
    });
  }

  backToCatalog() {
    this.router.navigateByUrl('/catalogo');
  }

  goToCollections() {
    this.router.navigateByUrl('/collections');
  }

  edit() {
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  //Carga los últimos 10 eventos de puntos
  loadHistory(id: string) {
    this.points.getHistory(id, 10).subscribe(history => {
      this.history.set(history);
    });
  }

  setDefaultAvatar(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'default.png';
  }

  metodoPruebaSumarPuntos() {
    const today = new Date();
    const user = this.usuario();

    if (!user) {
      alert("No hay usuario logueado");
      return;
    }

    const gained = this.points.randomPoints();

    this.points.addPoints(user, gained, `Prueba: se otorgaron ${gained} puntos`)
      .subscribe(updatedUser => {

        const event: PointEvent = {
          amount: gained,
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
