import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Team, TeamPokemon } from '../user/user-model';
import { environment } from '../../enviroments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/teams`;

  /**
   * Obtiene todos los equipos del usuario autenticado
   */
  getUserTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(this.baseUrl);
  }

  /**
   * Obtiene un equipo específico
   */
  getTeamById(id: string): Observable<Team> {
    return this.http.get<Team>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea un nuevo equipo
   */
  createTeam(name?: string): Observable<Team> {
    return this.http.post<Team>(this.baseUrl, { name });
  }

  /**
   * Actualiza el nombre de un equipo
   */
  updateTeamName(id: string, name: string): Observable<Team> {
    return this.http.patch<Team>(`${this.baseUrl}/${id}/name`, { name });
  }

  /**
   * Elimina un equipo
   */
  deleteTeam(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  /**
   * Agrega un pokemon a un equipo
   */
  addPokemon( teamId: string, pokemonId: number, nickname?: string): Observable<TeamPokemon> {
    return this.http.post<TeamPokemon>(
      `${this.baseUrl}/${teamId}/pokemon`,
      { pokemon_id: pokemonId, nickname }
    );
  }

  /**
   * Elimina un pokemon de un equipo
   */
  removePokemon(pokemonId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/pokemon/${pokemonId}`
    );
  }

  /**
   * Actualiza el nickname de un pokemon
   */
  updatePokemonNickname(
    pokemonId: string,
    nickname: string
  ): Observable<TeamPokemon> {
    return this.http.patch<TeamPokemon>(
      `${this.baseUrl}/pokemon/${pokemonId}/nickname`,
      { nickname }
    );
  }
}
