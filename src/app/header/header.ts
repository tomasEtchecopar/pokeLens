import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLinkActive, RouterLinkWithHref } from "@angular/router";
import { AuthServ } from '../core/auth.service';
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

  readonly user = computed(() => this.auth.activeUser());
  readonly sidebarOpen = signal(false);


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
    this.router.navigateByUrl('user/profile');
  }

  goToLeaderboard(){
    this.router.navigateByUrl('leaderboard');
  }

  goToTeams(){
    this.router.navigateByUrl('user/teams');
  }

  goToCatalog(){
    this.router.navigateByUrl('/catalog')
  }

isAlreadyInCatalog(): boolean {
  const path = this.router.url;
  return path === '/catalog' || path.startsWith('/details/');
}

  isAlreadyInTeams(): boolean{
    return this.router.url === '/user/teams'
  }

  isAlreadyInLeaderboard(): boolean{
    return this.router.url === '/leaderboard'
  }

  isAlreadyInProfile(): boolean {
    return this.router.url === '/user/profile'
  }

  setDefaultAvatar(event: Event) {
  const img = event.target as HTMLImageElement;
  img.src = '/assets/images/default.png';
}

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

}
