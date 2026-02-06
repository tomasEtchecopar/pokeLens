import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';


@Component({
  selector: 'app-footer',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  private router = inject(Router);

  goToRepo() {
    window.open('https://github.com/tomasEtchecopar/pokeLens', '_blank');
  }
  // scrollTop() {
  //   window.scrollTo({ top: 0, behavior: 'smooth' });
  // }
  goToTerms(){
    this.router.navigateByUrl('/about/terms');
  }

}
