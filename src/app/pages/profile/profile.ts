import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import { AuthServ } from '../../core/auth.service';
import { PointsService } from '../../core/points.service';
import { PointEvent } from '../../user/user-model';
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
    this.points.getHistory(id, Infinity).subscribe(history => {
      this.history.set(history);
    });
    this.history().reverse();
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

}
