import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import { AuthServ } from '../../core/auth.service';
import { PointsService } from '../../core/points.service';
import { PointEvent } from '../../user/user-model';
import { SignIn } from '../sign-in/sign-in';
import { UserClient } from '../../core/user-client.service';

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

  goToCollections() {
    this.router.navigateByUrl('/collections');
  }

  edit() {
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
  }

  loadHistory(id: string) {
    this.points.getHistory(id).subscribe(history => {
      this.history.set([...history].reverse());
    });
  }


  setDefaultAvatar(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'default.png';
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
        alert('Hubo un error al eliminar la cuenta.');
      }
    });
  }



}
