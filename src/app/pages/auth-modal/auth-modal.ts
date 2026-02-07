import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-modal',
  imports: [],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.css',
})
export class AuthModal {
  private router = inject(Router);

  goToLogin() {
    this.router.navigateByUrl('/logIn');
  }

  goToSignIn() {
    this.router.navigateByUrl('/signIn');
  }

  backToHome() {
    this.router.navigateByUrl('/home');
  }
  backToCatalog() {
    this.router.navigateByUrl('/catalog');
  }
}
