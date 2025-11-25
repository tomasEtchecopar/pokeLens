import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { Pokemon } from './models/pokemon-models';
import { environment } from '../../enviroments/enviroment';
import { Observable } from 'rxjs';

export interface PokemonResponse {
  data: Pokemon[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pokemon`;

  getPokemonChunk(opts: {
  offset: number;
  limit: number;
  search?: string;
  filters?: any;
  sort?: { key: string; dir: string };
}) {
  let params = new HttpParams()
    .set('offset', String(opts.offset))
    .set('limit', String(opts.limit));

  if (opts.search !== undefined && opts.search !== '') params = params.set('search', opts.search);

  if (opts.sort) {
    // backend espera sortBy / sortDir
    params = params.set('sortBy', opts.sort.key).set('sortDir', opts.sort.dir);
  }

  if (opts.filters) {
    Object.entries(opts.filters).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '') return;
      // backend espera minHeight/maxHeight/minWeight/maxWeight en unidades originales (decimeters/hectograms)
      params = params.set(k, String(v));
    });
  }

  // usa la ruta singular que define Express
  return this.http.get<PokemonResponse>(`${this.baseUrl}`, { params })
    .pipe(map(resp => resp.data || []));
}

  getPokemonById(id: number): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.baseUrl}/${id}`);
  }

  getPokemonByName(name: string): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.baseUrl}/name/${name}`);
  }

  getEvolution(id: number): Observable<{ evolution_line: number[] }> {
    return this.http.get<{ evolution_line: number[] }>(`${this.baseUrl}/${id}/evolution`);
  }

  getImages(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${id}/images`);
  }

  getTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/types`);
  }

  getGenerations(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/generations`);
  }

  getRegions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/regions`);
  }

  getStats(): Observable<{
    total: number;
    types: number;
    generations: number;
    regions: number;
  }> {
    return this.http.get<{
      total: number;
      types: number;
      generations: number;
      regions: number;
    }>(`${this.baseUrl}/stats`);
  }

}