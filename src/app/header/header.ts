import { Component, computed, inject } from '@angular/core';
import { Router, RouterLinkActive, RouterLinkWithHref } from "@angular/router";
import { AuthServ } from '../core/auth.service';
import { PokemonQuizService } from '../pages/pokemon-quiz/pokemon-quiz-service';
import { NotificationMenu } from '../components/notification-menu/notification-menu.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.css',
  imports: [RouterLinkActive, RouterLinkWithHref, NotificationMenu],
})
export class Header {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthServ);
  private readonly quiz = inject(PokemonQuizService)

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
    this.router.navigateByUrl('profile');
  }

  goToLeaderboard(){
    this.router.navigateByUrl('leaderboard');
  }

  goToTeams(){
    this.router.navigateByUrl('teams');
  }

  goToCatalog(){
    this.router.navigateByUrl('/catalog')
  }

isAlreadyInCatalog(): boolean {
  const path = this.router.url;
  return path === '/catalog' || path.startsWith('/details/');
}

  isAlreadyInTeams(): boolean{
    return this.router.url === '/teams'
  }

  logOut() {
    this.auth.logOut();
    this.router.navigateByUrl('home');
     this.quiz.resetStats();
  }
  setDefaultAvatar(event: Event) {
  const img = event.target as HTMLImageElement;
  img.src = '/assets/images/default.png';
}

}
