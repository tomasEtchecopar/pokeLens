import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LogInService {
  /*private readonly baseUrl = 'http://localhost:3000/users';
  private readonly http = inject(HttpClient);

  logIn(username: string, password: string) {/* 
    return this.http.get<user>(`${this.baseUrl}?username=${username}&password=${password}`); // CON ENDPOINTS DE NOMBRE Y CONTRASEÑA */

    /*const users[] = this.http.get<user[]>(this.baseUrl);
    return users.find(user => user.username === username && user.password === password);
    }*/

}
