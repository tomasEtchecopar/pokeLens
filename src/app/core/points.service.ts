import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PointEvent, User } from '../user/user-model';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class PointsService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/users';


  //Otorga entre 0 y 20 puntos , utilizada en el registro 
  randomPoints() {
    return Math.floor(Math.random() * (20 - 0 + 1))
  }

  //Obtiene el historial de asignaciones de puntos, usada en el perfil del usuario
  getHistory(userId: string, limit = 10): Observable<PointEvent[]> {
    return this.http.get<User>(`${this.baseUrl}/${userId}`).pipe(
      map(user => (user.pointsHistory ?? []).slice(-limit))
    );
  }

  /**
  * Otorga puntos por login diario.
  * Regla: si lastLoginDate es de otro día distinto a HOY suma 10 puntos.
  * Devuelve el usuario actualizado (o el mismo si no se otorgaron puntos).
  */
  awardLoginPoints(user: User): Observable<User> {

    if (!user.id) return of(user);

    const today = new Date();
    const last = user.lastLoginDate ? new Date(user.lastLoginDate) : null;

    const isSameDay =
      last &&
      last.getFullYear() === today.getFullYear() &&
      last.getMonth() === today.getMonth() &&
      last.getDate() === today.getDate();

    // No suma puntos y actualiza lastLoginDate
    if (isSameDay) {
      const updated: User = {
        ...user,
        lastLoginDate: today.toISOString()
      };
      return this.http.put<User>(`${this.baseUrl}/${user.id}`, updated);
    }

    // Sumamos +10 puntos por login diario
    const event: PointEvent = {
      amount: 10,
      reason: 'Inicio de sesión diario',
      date: today.toISOString()
    };

    const updatedWithPoints: User = {
      ...user,
      points: (user.points ?? 0) + 10,
      lastLoginDate: today.toISOString(),
      pointsHistory: [...(user.pointsHistory ?? []), event]
    };

    return this.http.put<User>(`${this.baseUrl}/${user.id}`, updatedWithPoints).pipe(
      tap(() => alert('Se le asignaron +10 Puntos por su ingreso diario!'))
    );
  }



  /**
   * Método GENÉRICO: sumar puntos por cualquier acción.
   * @param user   Usuario actual
   * @param amount Cantidad de puntos
   * @param reason (opcional) Texto del motivo ("+10 puntos por crear una lista")
   * @param reason2 (opcional) Para que no genere un alerta, pero se registre el motivo de los puntos
   * ambos reason pueden ser undefined, si se desea un alert se debe pasar en reason, sino en reason2
   */
  addPoints(user: User, amount: number, reason?: string, reason2?: string): Observable<User> {
    if (!user.id) return of(user);

    const updated: User = {
      ...user,
      points: (user.points ?? 0) + amount,
      pointsHistory: user.pointsHistory ?? []   
    };

    if (reason) {
      return this.alertAddPoints(updated, user.id, reason);
    } else {
      return this.notAlertAddPoints(updated, user.id, reason2 ?? '');
    }
  }

  alertAddPoints(user: User, id: string, reason: string): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, user).pipe(
      tap(() => {
        alert(reason);
      })
    );
  }

  notAlertAddPoints(user: User, id: string, reason2: string): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, user).pipe(
      tap((updatedUser) => {
        console.log(`Puntos actualizados (${reason2}) — total: ${updatedUser.points}`);
      })
    );
  }



  /**
   *Registra un evento que sume puntos, 
      * AUN SIN IMPLEMENTAR REALMENTE (si en pruebas)
   * @param user   Usuario actual
   * @param event   pointsHistory?: PointEvent[];
   */
  addHistory(user: User, event: PointEvent): Observable<User> {
    if (!user.id) return of(user);

    const updatedUser: User = {
      ...user,
      pointsHistory: [...(user.pointsHistory ?? []), event]
    };

    return this.http.put<User>(`${this.baseUrl}/${user.id}`, updatedUser);
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