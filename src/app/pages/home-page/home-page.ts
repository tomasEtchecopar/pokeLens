import { Component, signal } from '@angular/core';
import { DailyPokemonService } from '../../pokemon/daily-pokemon/daily-pokemon-service';
import { inject } from '@angular/core';
import { PokemonCard } from "../../pokemon/pokemon-card/pokemon-card";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthServ } from '../../core/auth.service';

@Component({
  selector: 'app-home-page',
  imports: [PokemonCard, RouterLink, RouterLinkActive],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})

/**
 * HOME PAGE component. Main route of our app
 */
export class HomePage {
  private readonly dailyPokemonService = inject(DailyPokemonService);

   readonly pokemonOfTheDay = this.dailyPokemonService.pokemonOfTheDay;
  readonly loadingDaily = this.dailyPokemonService.isLoading;

}
