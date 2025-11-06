import { Component, inject } from '@angular/core';
import { Router, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.css',
  imports: [RouterLinkActive],
})
export class Header {
  private readonly router = inject(Router);

  goToSignIn(){
    this.router.navigateByUrl('signIn');
  }
  goToLogIn(){
    this.router.navigateByUrl('logIn');
  }
  goToCatalog(){
    this.router.navigateByUrl('catalog');
  }
}
