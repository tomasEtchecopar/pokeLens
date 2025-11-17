import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./header/header";
import { FormsModule } from '@angular/forms';
import { AuthServ } from './core/auth.service';
import { Footer } from './footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, FormsModule,Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('pokeLens');

  private readonly auth = inject(AuthServ);

  constructor() {
    this.auth.restoreSession();
  }

}
