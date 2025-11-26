import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Pokemon } from '../../pokemon/models/pokemon-models';
import { AuthServ } from '../../core/auth.service';
import { User } from '../../user/user-model';
import { TeamService } from '../../core/team.service';
import { Team } from './team-model';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/notification.service';

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
                <label for="team">Equipo:</label>

                  <select
                    id="team"
                    [(ngModel)]="selectedTeamId">
                    @for (team of teams(); track team.id) {
                      <option [value]="team.id">
                        {{ team.name }} ({{ team.pokemons.length }} Pokémon)
                      </option>
                    }
                    <option value="new">+ Nuevo equipo</option>
                  </select>

                @if (isCreatingNewTeam()) {
                  <div class="form-group">
                    <label for="newTeamName">Nombre del nuevo equipo:</label>
                    <input
                      id="newTeamName"
                      type="text"
                      maxlength="20"
                      [ngModel]="newTeamName()"
                      (ngModelChange)="newTeamName.set($event)"
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
  private readonly router = inject(Router);
  private readonly auth = inject(AuthServ);
  private readonly teamService = inject(TeamService);
  private readonly notification = inject(NotificationService);

  newTeamName = signal('');

  pokemon = input.required<Pokemon>();
  isOpen = input.required<boolean>();

  closed = output<void>();
  captured = output<void>();

  selectedTeamId = signal<string | 'new'>('new');
  nickname = signal('');
  isLoading = signal(false);
  errorMessage = signal('');

  usuario = this.auth.activeUser;
  teams = signal<Team[]>([]);

  constructor() {
    // Cargar teams del usuario cuando el modal se abre
    effect(() => {
      if (this.isOpen() && this.auth.activeUser()?.id) {
        this.loadTeams();
      }
    });
  }

  /**
   * Carga los equipos del usuario desde la API
   */
  private loadTeams() {
    this.teamService.getUserTeams().subscribe({
      next: (teams) => {
        this.teams.set(teams);
        // Seleccionar primer equipo por defecto si existe
        if (teams.length > 0) {
          this.selectedTeamId.set(teams[0].id);
        }
      },
      error: (err) => {
        console.error('Error cargando equipos:', err);
      }
    });
  }

  /**
   * Calcula días de diferencia entre dos fechas
   */
  private daysBetween(a: string, b: string): number {
    const msA = new Date(a).getTime();
    const msB = new Date(b).getTime();
    return (msB - msA) / (1000 * 60 * 60 * 24);
  }

  close() {
    this.nickname.set('');
    this.errorMessage.set('');
    this.newTeamName.set('');
    this.closed.emit();
  }

  /**
   * Captura el Pokémon y lo agrega al equipo seleccionado.
   *
   * Flujo:
   * 1. Valida usuario y pokemon
   * 2. Si es equipo nuevo, lo crea primero
   * 3. Valida límite de 6 pokemon por equipo
   * 4. Valida que no esté duplicado
   * 5. Agrega el pokemon al equipo
   * 6. Si corresponde, otorga bonus semanal por crear equipo
   */
  capturePokemon() {
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

    const isNewTeam = this.isCreatingNewTeam();

    // Validar nombre si es equipo nuevo
    if (isNewTeam) {
      const name = this.newTeamName().trim();
      if (!name) {
        this.errorMessage.set('Ingresá un nombre para el nuevo equipo.');
        return;
      }
    }

    // Validar límite de 6 pokemon si es equipo existente
    if (!isNewTeam) {
      const selectedTeam = this.teams().find(t => t.id === this.selectedTeamId());
      if (selectedTeam && selectedTeam.pokemons.length >= 6) {
        this.errorMessage.set('Este equipo ya tiene 6 Pokémon (límite máximo).');
        return;
      }

      // Validar que no esté duplicado
      const alreadyInTeam = selectedTeam?.pokemons.some(
        p => p.pokemon_id === pkm.id
      );
      if (alreadyInTeam) {
        this.errorMessage.set('Este Pokémon ya está en este equipo.');
        return;
      }
    }

    this.isLoading.set(true);
    this.errorMessage.set('');


    if (isNewTeam) {
      // FLUJO: Crear equipo nuevo y luego agregar pokemon
      this.teamService.createTeam(this.newTeamName().trim()).subscribe({
        next: (response: any) => {
          const newTeam = response.team || response;
          const pointsAwarded = response.pointsAwarded || 0;
          const updatedUser = response.user;

          // Actualizar usuario en auth si se retorna
          if (updatedUser) {
            this.auth.activeUser.set(updatedUser);
            localStorage.setItem('activeUser', JSON.stringify(updatedUser));
          }

          // Mostrar notificación de puntos
          if (pointsAwarded > 0) {
            this.notification.notify(`¡Nuevo equipo creado! +${pointsAwarded} puntos`);
          }

          // Agregar pokemon al equipo recién creado
          this.addPokemonToTeam(newTeam.id, pkm.id, this.nickname().trim(), pkm.name);
        },
        error: (err) => {
          console.error('Error creando equipo:', err);
          this.notification.notify('Error al crear el equipo');
          this.isLoading.set(false);
        }
      });
    } else {
      // FLUJO: Agregar pokemon a equipo existente
      this.addPokemonToTeam(
        this.selectedTeamId() as string,
        pkm.id,
        this.nickname().trim(),
        pkm.name
      );
    }
  }

  /**
   * Agrega un pokemon a un equipo específico
   */
  private addPokemonToTeam(teamId: string, pokemonId: number, nickname: string, pokemonName?: string) {
    this.teamService.addPokemon(teamId, pokemonId, nickname).subscribe({
      next: (response: any) => {
        const pointsAwarded = response.pointsAwarded || 0;
        const updatedUser = response.user;

        // Actualizar usuario en auth si se retorna
        if (updatedUser) {
          this.auth.activeUser.set(updatedUser);
          localStorage.setItem('activeUser', JSON.stringify(updatedUser));
        }

        // Mostrar notificación de puntos
        if (pointsAwarded > 0) {
          this.notification.notify(`¡Pokémon capturado! +${pointsAwarded} puntos`);
        }

        console.log('Pokemon agregado exitosamente');
        this.finishCapture(pokemonName || 'Pokémon');
      },
      error: (err) => {
        console.error('Error agregando pokemon:', err);
        this.notification.notify('Error al capturar el Pokémon');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Finaliza el proceso de captura
   */
  private finishCapture(pokemonName: string) {
    this.isLoading.set(false);
    this.captured.emit();
    this.close();
    this.notification.notify(`¡${pokemonName} capturado exitosamente!`);

    // Recargar teams para reflejar cambios
    this.loadTeams();
  }

  /**
   * Verifica si está creando un equipo nuevo
   */
  isCreatingNewTeam(): boolean {
    return this.selectedTeamId() === 'new';
  }

  /**
   * Obtiene el nombre de un equipo por índice
   */
  getTeamName(index: number): string {
    const teams = this.teams();
    if (index < teams.length) {
      return teams[index].name;
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
