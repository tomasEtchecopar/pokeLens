import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../user/user-model';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class PointsService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/users';

  /**
  * Otorga puntos por login diario.
  * Regla: si lastLoginDate es de otro día distinto a HOY → +10 puntos.
  * Devuelve el usuario actualizado (o el mismo si no se otorgaron puntos).
  */

  awardLoginPoints(user: User): Observable<User> {

    if (!user.id) {
      return of(user);
    }
    const today = new Date;
    const last = user.lastLoginDate ? new Date(user.lastLoginDate) : null;

    const isSameDay = last
      && last.getFullYear() === today.getFullYear()
      && last.getMonth() === today.getMonth()
      && last.getDate() === today.getDate();

    if (isSameDay) {
      return of(user);
    }

    const updated: User = {
      ...user, points: (user.points ?? 0) + 10,
      lastLoginDate: today.toISOString()
    }

    return this.http.put<User>(`${this.baseUrl}/${user.id}`, updated).pipe(tap(() => {
      alert('Se le asignaron +10 Puntos por su ingreso diario!')
    }))
  }

  /**
   * Método GENÉRICO: sumar puntos por cualquier acción.
   *
   * @param user   Usuario actual
   * @param amount Cantidad de puntos
   * @param reason (opcional) Texto del motivo ("+10 puntos por crear una lista")
   */
  addPoints(user: User, amount: number, reason?: string): Observable<User> {
    if (!user.id) return of(user);

    const updated: User = {
      ...user,
      points: (user.points ?? 0) + amount
    };

    return this.http.put<User>(`${this.baseUrl}/${user.id}`, updated).pipe(
      tap(() => {
        if (reason) {
          alert(`${reason}`);
        }
      })
    );
  }
}
//Aplicacion
/* const user = this.auth.activeUser();

  if (!user) return;
  
  this.points.addPoints(
    user,
    10,
    '+10 puntos por agregar un Pokémon a tu colección'
  ).subscribe(updatedUser => {

    // actualizar usuario activo
    this.auth.activeUser.set(updatedUser);
    localStorage.setItem('activeUser', JSON.stringify(updatedUser));
  });
}*/