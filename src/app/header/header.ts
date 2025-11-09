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
  goToHome() {
    this.router.navigateByUrl('home');
  }

  goToProfile() {
    this.router.navigateByUrl('/profile'); 
  }

  logOut() {
    this.auth.logOut();
    this.router.navigateByUrl('/catalog');
  }
  setDefaultAvatar(event: Event) {
  const img = event.target as HTMLImageElement;
  img.src = 'default.png';
}

}
