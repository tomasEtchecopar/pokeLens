import { RouterLink, RouterLinkActive } from '@angular/router';
import { Component } from '@angular/core';
import { LegalDocumentComponent } from '../legal-document/legal-document.component';

@Component({
  selector: 'app-privacy',
  imports: [RouterLink, RouterLinkActive,LegalDocumentComponent],
  templateUrl: './privacy.html',
  styleUrl: './privacy.css',
})
export class Privacy {

}
