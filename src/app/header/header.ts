import { Component, computed, inject } from '@angular/core';
import { Router, RouterLinkActive } from "@angular/router";
import { AuthServ } from '../core/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.css',
  imports: [RouterLinkActive],
})
export class Header {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthServ);

  readonly user = computed(() => this.auth.activeUser());


  goToSignIn() {
    this.router.navigateByUrl('signIn');
  }
  goToLogIn() {
    this.router.navigateByUrl('logIn');
  }
  goToCatalog() {
    this.router.navigateByUrl('catalog');
  }

  goToProfile() {
    this.router.navigateByUrl('/perfil'); // asegurate de tener esta ruta
  }

  logOut() {
    this.auth.logOut();
    this.router.navigateByUrl('/login');
  }
  setDefaultAvatar(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/avatars/default.jpg';
  }

}
