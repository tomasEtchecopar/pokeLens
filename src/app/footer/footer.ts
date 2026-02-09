import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  private router = inject(Router);

  goToRepo() {
    window.open('https://github.com/tomasEtchecopar/pokeLens', '_blank');
  }

  goToTerms(){
    this.router.navigateByUrl('/about/terms');
  }

  goToPrivacy(){
    this.router.navigateByUrl('/about/privacy');
  }

  goToContact(){
    this.router.navigateByUrl('/about/contact');
  }
}
