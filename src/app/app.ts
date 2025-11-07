import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./header/header";
import { effect } from '@angular/core';
import { inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PokemonListService } from './pokemon/pokemon-list-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('pokeLens');
  //injecting service to load all pokemons in memory
  private readonly pokemonListService = inject(PokemonListService);
  
}
