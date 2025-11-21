import { Component, effect, inject, input, output, signal } from '@angular/core';
import { pokemonVault } from './collection-model';
import { FormsModule } from '@angular/forms';
import { Pokemon } from '../../pokemon/models/pokemon-models';
import { AuthServ } from '../../core/auth.service';
import { UserClient } from '../../core/user-client.service';
import { PointsService } from '../../core/points.service';
import { PointEvent, User } from '../../user/user-model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-pokemon-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (isOpen()) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Añadir {{ pokemon().name }} a equipo</h3>
            <button class="close-btn" (click)="close()">✕</button>
          </div>



          <div class="modal-body">
           @if (!usuario()) {
            <div class="auth-modal-content">
              <h2>¡Entrenador, necesitamos tu identificación!</h2>
              <p class="auth-modal-info">Iniciá sesión o creá una cuenta para poder capturar Pokémon.</p>

            <div class="auth-modal-actions">
               <button class="btn-signIn" type="button" (click)="goLogin()">
                   Iniciar sesión
                </button>

                <button class="btn-signIn btn-signIn-secondary" type="button" (click)="goRegister()">
                   Crear cuenta
                </button>
            </div>

    <button class="auth-link-btn" type="button" (click)="close()">
               ← Volver
               </button>
             </div>
           }

 @else {
              <div class="form-group">
                <label for="collection">Equipo:</label>

                  <select
                    id="collection"
                    [ngModel]="selectedCollection()"
                    (ngModelChange)="selectedCollection.set(+$event)">
                    @for (col of collections(); let i = $index; track i) {
                      <option [value]="i + 1">
                        {{ getCollectionName(i) }} ({{ col.length }} Pokémon)
                      </option>
                    }
                    <option [value]="collections().length + 1">
                      + Nuevo equipo
                    </option>
                  </select>

                @if (isCreatingNewCollection()) {
                  <div class="form-group">
                    <label for="newCollectionName">Nombre de la nuevo equipo:</label>
                    <input
                      id="newCollectionName"
                      type="text"
                      maxlength="20"
                      [ngModel]="newCollectionName()"
                      (ngModelChange)="newCollectionName.set($event)"
                      placeholder="Ej: Equipo Fuego"
                    >
                  </div>
                }

              </div>

              <div class="form-group">
                <label for="nickname">Apodo (opcional):</label>
                <input
                  type="text"
                  id="nickname"
                  [(ngModel)]="nickname"
                  [placeholder]="pokemon().name"
                  maxlength="20"
                >
              </div>

              @if (errorMessage()) {
                <p class="error-message">{{ errorMessage() }}</p>
              }

              <div class="modal-actions">
                <button class="btn-cancel" (click)="close()">Cancelar</button>
                <button class="btn-capture" (click)="capturePokemon()" [disabled]="isLoading()">
                  {{ isLoading() ? 'Capturando...' : '✓ Capturar' }}
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: linear-gradient(180deg, #2c2c2c, #262626);
      border: 4px solid #5f0b0b;
      box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
      width: 90%;
      max-width: 500px;
      animation: slideDown 0.3s ease;
      font-family: Inter, "Courier New", monospace;
    }

    @keyframes slideDown {
      from {
        transform: translateY(-50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 3px solid rgba(0, 0, 0, 0.6);
      background: linear-gradient(90deg, #3a3a3a, #2c2c2c);
    }

    .modal-header h3 {
      margin: 0;
      color: #ffd700;
      font-size: 1.1rem;
      text-transform: capitalize;
      font-weight: 900;
      text-shadow: 2px 2px 0 #111;
    }

    .close-btn {
      background: #d43030;
      border: 2px solid #000;
      color: #fff;
      width: 32px;
      height: 32px;
      border-radius: 4px;
      font-size: 1.2rem;
      cursor: pointer;
      transition: transform 0.1s ease;
    }

    .close-btn:hover {
      transform: scale(1.1);
      background: #e64040;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-group {
    margin-top: 1rem;
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      color: #ffd700;
      font-weight: 700;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-group select,
    .form-group input {
      width: 100%;
      padding: 0.75rem;
      background: #1a1a1a;
      border: 2px solid #3a3a3a;
      color: #fff;
      font-size: 1rem;
      font-family: 'Courier New', monospace;
      box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.5);
    }

    .form-group select:focus,
    .form-group input:focus {
      outline: none;
      border-color: #ffd700;
    }

    .error-message {
      background: #d43030;
      color: #fff;
      padding: 0.75rem;
      border: 2px solid #000;
      margin-bottom: 1rem;
      font-weight: 700;
      text-align: center;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .btn-cancel,
    .btn-capture {
      padding: 0.75rem 1.5rem;
      border: 3px solid #000;
      font-weight: 900;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.1s ease;
      font-size: 0.9rem;
      letter-spacing: 1px;
    }

    .btn-cancel {
      background: linear-gradient(180deg, #3a3a3a, #2d2d2d);
      color: #fff;
    }

    .btn-cancel:hover {
      background: linear-gradient(180deg, #4a4a4a, #3d3d3d);
      transform: translate(1px, 1px);
    }

    .btn-capture {
      background: linear-gradient(180deg, #22c55e, #16a34a);
      color: #fff;
      box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
    }

    .btn-capture:hover:not(:disabled) {
      background: linear-gradient(180deg, #4ade80, #22c55e);
      transform: translate(1px, 1px);
    }

    .btn-capture:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .auth-modal-content {
  text-align: center;
  padding: 1rem 0.5rem;
}

.auth-modal-content h2 {
  margin-bottom: 1rem;
  color: #ffd700;
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.auth-modal-content p {
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.auth-modal-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.auth-modal-actions .btn-signIn {
  width: 100%;
  display: block;
  margin: 0;
  padding: 0.875rem;
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background 0.3s, transform 0.1s;
  box-shadow: 0 3px 0 #a02a2a;
}

.auth-modal-actions .btn-signIn:hover {
  background: #c82333;
  box-shadow: 0 3px 0 #8a2020;
}

.auth-modal-actions .btn-signIn:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 #8a2020;
}

.btn-signIn-secondary {
  background: #6c757d !important;
  box-shadow: 0 3px 0 #495057 !important;
}

.btn-signIn-secondary:hover {
  background: #5a6268 !important;
  box-shadow: 0 3px 0 #3a3f44 !important;
}

.btn-signIn-secondary:active {
  box-shadow: 0 1px 0 #3a3f44 !important;
}

.auth-link-btn {
  background: transparent;
  border: none;
  color: #ffd700;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 0.5rem;
}

.auth-link-btn:hover {
  color: #ffe680;
}
.auth-modal-info {
  color: #ffd700;
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  text-shadow: 1px 1px 0 #000;
}


  `]
})
export class AddPokemonModal {
  private readonly router = inject(Router)
  private readonly auth = inject(AuthServ);
  private readonly userClient = inject(UserClient);
  private readonly points = inject(PointsService);
  newCollectionName = signal('');


  pokemon = input.required<Pokemon>();
  isOpen = input.required<boolean>();

  closed = output<void>();
  captured = output<void>();

  selectedCollection = signal(1);
  nickname = signal('');
  isLoading = signal(false);
  errorMessage = signal('');

  usuario = this.auth.activeUser;
  collections = signal<pokemonVault[][]>([]);

  constructor() {
    effect(() => {
      if (this.auth.activeUser()?.pokemon_vault) {
        this.collections.set(this.auth.activeUser()!.pokemon_vault!);
      }
    })
  };

  /**
   * Calculates days of difference between parameters
   */
  private daysBetween(a: string, b: string): number {
    const msA = new Date(a).getTime();
    const msB = new Date(b).getTime();
    return (msB - msA) / (1000 * 60 * 60 * 24);
  }

  private shouldRewardWeeklyCollection(user: User, isNewCollection: boolean, nowIso: string): boolean {
    if (!isNewCollection) return false; // solo premiamos una nuevo equipo

    if (!user.last_created_collection) {
      // Nunca se premió una equipo y es la  primera vez
      return true;
    }

    const diffDays = this.daysBetween(user.last_created_collection, nowIso);
    return diffDays >= 7; // 7 días o más
  }

  close() {
    this.nickname.set('');
    this.errorMessage.set('');
    this.selectedCollection.set(1);
    this.newCollectionName.set('');
    this.closed.emit();
  }



  /**
   * Intenta capturar el Pokémon seleccionado y agregarlo a el equipo elegida.
   *
   * Flujo general:
   * 1. Valida que haya usuario logueado y Pokémon valido.
   * 2. Controla:
   *    - que el equipo no tenga más de 6 Pokémon,
   *    - que el Pokémon no esté repetido en esa equipo,
   *    - que si es una equipo nuevo, tenga nombre.
   * 3. Llama al backend para agregar el Pokémon a el equipo.
   * 4. Si corresponde, otorga puntos por crear una equipo semanal y registra el evento.
   * 5. Actualiza el usuario activo en memoria y en localStorage.
   */
  capturePokemon() {
    // Usuario logueado actual (signal) y Pokémon que llega por input
    const user = this.usuario();
    const pkm = this.pokemon();

    if (!user || !user.id) {
      this.errorMessage.set('Debes iniciar sesión');
      return;
    }

    if (!pkm) {
      this.errorMessage.set('Pokémon no válido');
      return;
    }
    //------------------------------------------------------------------------------
    // Sector donde se controla la cantidad de pokemones en el array
    const matrix = this.collections();              // Matriz de equipos: pokemon_vault[][]
    const selectedIndex = this.selectedCollection() - 1; //indice de el equipo elegida

    const currentCount = matrix[selectedIndex]?.length ?? 0; //calcula los pokemones en el equipo

    if (currentCount >= 6) {
      this.errorMessage.set('Esta equipo ya tiene 6 Pokémon (límite máximo).');
      return;
    }
    //------------------------------------------------------------------------------
    // Evitar Pokémon duplicado en la misma equipo
    const selectedCollectionEntries = matrix[selectedIndex] ?? [];

    const alreadyInCollection = selectedCollectionEntries.some(//verificamos el id en el array
      entry => entry.idPokemon === pkm.id
    );

    if (alreadyInCollection) {
      this.errorMessage.set('Este Pokémon ya está en esta equipo.');
      return;
    }
    //------------------------------------------------------------------------------

    this.isLoading.set(true);
    this.errorMessage.set('');

    //Este es el objeto que se agregara al array de Pokemones
    const pokemonData: pokemonVault = {
      arrayId: 0, // se asigna en el service
      idPokemon: pkm.id,
      name: pkm.name,
      nickname: this.nickname().trim() || undefined
    };


    const pointsCollection = 50; //puntos a dar por la creacion de el equipo
    const nowIso = new Date().toISOString(); //Fecha y hora actual

    // Indica si el usuario seleccionó la opción "+ Nuevo equipo"
    const isNewCollection = this.isCreatingNewCollection();

    // si es una equipo nuevo, se le pide ingresar un nombre
    if (isNewCollection) {
      const name = this.newCollectionName().trim();
      if (!name) {
        this.errorMessage.set('Ingresá un nombre para la nuevo equipo.');
        this.isLoading.set(false);
        return;
      }
    }

    // Llamada al backend para agregar el pokémon a el equipo del usuario
    this.userClient
      .addPokemonToVault(user.id, pokemonData, this.selectedCollection())
      .subscribe({
        next: (updatedUser) => {
          // Usuario devuelto por el backend luego de agregar el pokémon
          let userWithCollections: User = updatedUser;

          // Si se creo una equipo nuevo, agregamos el nombre al array de nombres
          if (isNewCollection) {
            const names = [...(updatedUser.collection_names ?? [])];
            const name = this.newCollectionName().trim();

            names.push(name);

            userWithCollections = {
              ...updatedUser,
              collection_names: names
            };
            // Limpiamos el input del nombre de equipo para futuras capturas
            this.newCollectionName.set('');
          }

          // Aca se chequea si corresponde dar el bonus semanal por crear equipo
          const giveWeeklyBonus = this.shouldRewardWeeklyCollection(
            userWithCollections,
            isNewCollection,
            nowIso
          );

          if (giveWeeklyBonus) {
            // Actualizamos la fecha de última creación de equipo
            const updatedUserWithDate: User = {
              ...userWithCollections,
              last_created_collection: nowIso
            };

            // Sumamos puntos por el equipo semanal
            this.points
              .addPoints(
                updatedUserWithDate,
                pointsCollection,
                'Sumaste puntos por crear tu equipo semanal!'
              )
              .subscribe(userWithPoints => {
                const event: PointEvent = {
                  amount: pointsCollection,
                  reason: 'Puntos por crear equipo semanal',
                  date: nowIso
                };

                // Registramos el evento en el historial de puntos
                this.points.addHistory(userWithPoints, event)
                  .subscribe(finalUser => {
                    this.auth.activeUser.set(finalUser);
                    localStorage.setItem('activeUser', JSON.stringify(finalUser));
                  });
              });

          } else {
            // Si no hay bonus semanal, igual persistimos el usuario con los equipos/nombres actualizados
            this.userClient.updateUser(userWithCollections, userWithCollections.id!).subscribe({
              next: (savedUser) => {
                this.auth.activeUser.set(savedUser);
                localStorage.setItem('activeUser', JSON.stringify(savedUser));
              },
              error: (err) => {
                console.error('Error actualizando usuario con nombres de equipo', err);
              }
            });
          }
          // Fin del proceso de captura
          this.isLoading.set(false);
          this.captured.emit();
          this.close();
          alert(`¡${pkm.name} capturado exitosamente!`);
        }
        ,
        error: (error) => {
          console.error('Error al capturar Pokémon:', error);
          this.errorMessage.set('Error al capturar el Pokémon');
          this.isLoading.set(false);
        }
      });
  }


  isCreatingNewCollection(): boolean {
    // si seleccionó el value "length + 1", es la opción "+ Nuevo equipo"
    return this.selectedCollection() === this.collections().length + 1;
  }

  getCollectionName(index: number): string {
    const user = this.usuario();
    const names = user?.collection_names;
    const stored = names?.[index];

    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }
    return `Equipo ${index + 1}`;
  }
  goLogin() {
    this.close();
    this.router.navigate(['/logIn']);
  }

  goRegister() {
    this.close();
    this.router.navigate(['/signIn']);
  }


}
