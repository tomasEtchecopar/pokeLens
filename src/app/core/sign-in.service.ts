import { User } from '../user/user-model';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';



@Injectable({
  providedIn: 'root'
})
export class UserClient {


  private readonly http = inject(HttpClient);
  private readonly baseUrl = "http://localhost:3000/users"

  addUser(user: User){
    return this.http.post<User>(this.baseUrl, user);
  }

  updateUser(user: User, id: string | number){
    return this.http.put<User>(`${this.baseUrl}/${id}`, user)
  }

}
