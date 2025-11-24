import { Observable } from 'rxjs';
import { User } from '../user/user-model';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../enviroments/enviroment';
import { TeamPokemon } from '../pages/pokemon-teams/team-model';

@Injectable({
  providedIn: 'root'
})
export class UserClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  addUser(user: User): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(
      `${environment.apiUrl}/auth/register`,
      user
    );
  }

  updateUser(user: User, id: string | number): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  addPokemonToVault( userId: string, pokemon: TeamPokemon, teamNumber: number): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/${userId}/pokemon`, {
      pokemon,
      teamNumber
    });
  }

  removePokemonFromVault(
    userId: string,
    teamIndex: number,
    arrayId: number
  ): Observable<User> {
    return this.http.delete<User>(
      `${this.baseUrl}/${userId}/pokemon/${teamIndex}/${arrayId}`
    );
  }
  updateTeamName(
  userId: string,
  teamIndex: number,
  name: string
): Observable<User> {
  return this.http.patch<User>(
    `${this.baseUrl}/${userId}/teams/${teamIndex}/name`,
    { name }
  );
}

  updatePokemonNickname(
    userId: string,
    teamIndex: number,
    arrayId: number,
    nickname: string
  ): Observable<User> {
    return this.http.patch<User>(
      `${this.baseUrl}/${userId}/pokemon/${teamIndex}/${arrayId}/nickname`,
      { nickname }
    );
  }
}
