import { Injectable, inject } from '@angular/core';
import { Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NamedAPIResourceList } from './pokemon-models';
import { Pokemon } from './pokemon-models';

@Injectable({
  providedIn: 'root'
})


@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly baseURL = "https://pokeapi.co/api/v2";
  private readonly http = inject(HttpClient);

  getPokemonList(limit: number = 20, offset: number = 0){
    const url = `${this.baseURL}/pokemon?limit=${limit}&offset=${offset}`;
    return this.http.get<NamedAPIResourceList>(url);
  }

  getPokemonByName(name: string){
    return this.http.get<Pokemon>(`${this.baseURL}/pokemon/${name}`);
  }

  getPokemonByURL(url: string){
    return this.http.get<Pokemon>(url);
  }
}