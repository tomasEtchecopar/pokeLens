import { Component } from '@angular/core';
import { PokemonCatalog } from "../pokemon-catalog/pokemon-catalog";
import { DailyPokemonService } from '../../pokemon/daily-pokemon/daily-pokemon-service';
import { inject } from '@angular/core';
import { PokemonCard } from "../../pokemon/pokemon-card/pokemon-card";

@Component({
  selector: 'app-home-page',
  imports: [PokemonCard],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  private readonly dailyPokemonService = inject(DailyPokemonService); 

  readonly pokemonOfTheDay = this.dailyPokemonService.pokemonOfTheDay;
}
