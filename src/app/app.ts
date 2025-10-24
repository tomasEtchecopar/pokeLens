import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PokemonCatalog } from "./pokemon/pokemon-catalog/pokemon-catalog";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PokemonCatalog],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('pokeLens');
}
