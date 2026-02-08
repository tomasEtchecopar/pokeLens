import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import { AuthServ } from '../../core/auth.service';
import { PointsService } from '../../core/points.service';
import { NotificationService } from '../../core/notification.service';
import { PointEvent } from '../../user/user-model';
import { SignIn } from '../sign-in/sign-in';
import { UserClient } from '../../core/user-client.service';
import { PokemonQuizService } from '../pokemon-quiz/pokemon-quiz-service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [SignIn, DatePipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  private readonly auth = inject(AuthServ);
  private readonly quiz = inject(PokemonQuizService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);
  private readonly points = inject(PointsService);
  private readonly clienteService = inject(UserClient)
  isDeleteModalOpen = signal(false);
  confirmDeleteClick = signal(false);

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

  openDeleteModal() {
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
  }

  backToCatalog() {
    this.router.navigateByUrl('/catalog');
  }

  goToTeams() {
    this.router.navigateByUrl('/user/teams');
  }

  edit() {
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  loadHistory(id: string) {
    this.points.getHistory(id).subscribe(history => {
      this.history.set([...history]);
    });
  }


  setDefaultAvatar(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/default.png';
  }


  isAvatarOpen = false;

  openAvatar() {
    this.isAvatarOpen = true;
  }

  closeAvatar() {
    this.isAvatarOpen = false;
  }

  onDeleteButtonClick() {
    if (!this.confirmDeleteClick()) {
      // Primer click: solo entra en modo "¿Seguro?"
      this.confirmDeleteClick.set(true);

      // Opcional: si no hace el segundo click en 3s, se resetea
      setTimeout(() => {
        this.confirmDeleteClick.set(false);
      }, 3000);

      return;
    }

    // Segundo click: abrimos el modal real
    this.confirmDeleteClick.set(false);
    this.openDeleteModal();
  }

  logOut() {
    this.auth.logOut();
    this.router.navigateByUrl('home');
    this.quiz.resetStats();
  }
  confirmDeleteAccount() {
    const user = this.usuario();
    if (!user || !user.id) return;

    this.clienteService.deleteUser(user.id).subscribe({
      next: () => {
        localStorage.removeItem('activeUser');
        this.auth.activeUser.set(undefined);

        this.isDeleteModalOpen.set(false); // cerrar modal

        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        console.error('Error eliminando cuenta:', err);
        this.notification.notify('Hubo un error al eliminar la cuenta.');
      }
    });
  }


  getAge(birthDate: string): number {
    if (!birthDate) return 0;

    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return 0;

    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

}
