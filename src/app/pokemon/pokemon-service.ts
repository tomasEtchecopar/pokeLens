import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { httpResource } from '@angular/common/http';
import { NamedAPIResource } from './pokemon-models';


@Injectable({
  providedIn: 'root'
})


@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly baseURL = "https://pokeapi.co/api/v2";

  getPokemonList(limit: number = 20, offset: number = 0): Observable<NamedAPIResourceList> {
    const url = offset === 0 ? `${this.baseUrl}?limit=${limit}&offset=${offset}` : this.nextUrl!;
    const resource = new HttpResource<NamedAPIResourceList>(url, this.http);
    return resource.get();
  }
}