import { User } from './clientTemplate';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';



@Injectable({
  providedIn: 'root'
})
export class Client {


  private readonly http = inject(HttpClient);
  private readonly baseUrl = "http://localhost:3000/clients"

  addClient(user: User){
    return this.http.post<User>(this.baseUrl, user);
  }

  updateClient(user: User, id: number){
    return this.http.put<User>(`${this.baseUrl}/${id}`, user)
  }

}
