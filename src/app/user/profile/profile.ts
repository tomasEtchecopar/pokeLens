import { Component, computed, inject, signal } from '@angular/core';
import { AuthServ } from '../../core/auth.service';
import { Router } from '@angular/router';
import { SignIn } from '../sign-in/sign-in'; //Reutilizo el formulario de SignIn modificando OnSubmit


@Component({
  selector: 'app-profile',
  imports: [SignIn],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  readonly auth = inject(AuthServ);
  readonly router = inject(Router);

  usuario = computed(() => this.auth.activeUser());
  readonly isEditing = signal(false);


  backToCatalog() { this.router.navigateByUrl('/catalogo'); }
  edit() { this.isEditing.set(true); }
  cancelEdit() { this.isEditing.set(false); }
}
