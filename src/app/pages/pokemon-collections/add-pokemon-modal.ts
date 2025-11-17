import { pokemonVault } from './collection-model';
import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthServ } from '../../core/auth.service';
import { Pokemon } from '../../pokemon/models/pokemon-models';
import { UserClient } from '../../core/user-client.service';

@Component({
  selector: 'app-add-pokemon-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (isOpen()) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Añadir {{ pokemon().name }} a colección</h3>
            <button class="close-btn" (click)="close()">✕</button>
          </div>

          <div class="modal-body">
            @if (!usuario()) {
              <p class="error-message">Debes iniciar sesión para capturar Pokémon</p>
            } @else {
              <div class="form-group">
                <label for="collection">Colección:</label>
                <select id="collection" [(ngModel)]="selectedCollection">
  @for (col of collections(); let i = $index; track i) {
    <option [value]="i + 1">
      {{ getCollectionName(i) }} ({{ col.length }} Pokémon)
    </option>
  }
  <option [value]="collections().length + 1">
    + Nueva colección
  </option>
</select>

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
  `]
})
export class AddPokemonModal {
  private readonly auth = inject(AuthServ);
  private readonly userClient = inject(UserClient);

  // Inputs
  pokemon = input.required<Pokemon>();
  isOpen = input.required<boolean>();

  // Outputs
  closed = output<void>();
  captured = output<void>();

  // State
  selectedCollection = signal(1);
  nickname = signal('');
  isLoading = signal(false);
  errorMessage = signal('');

  // Computed
  usuario = this.auth.activeUser;
  collections = signal<pokemonVault[][]>([]);

  constructor() {
    // Cargar colecciones cuando se abre el modal
    effect(() => {
      if (this.auth.activeUser()?.pokemonVault) {
        this.collections.set(this.auth.activeUser()!.pokemonVault!);
      }
    })
  };


  close() {
    this.nickname.set('');
    this.errorMessage.set('');
    this.selectedCollection.set(1);
    this.closed.emit();
  }

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

    this.isLoading.set(true);
    this.errorMessage.set('');

    const pokemonData: pokemonVault = {
      arrayId: 0, // Se asignará automáticamente
      idPokemon: pkm.id,
      name: pkm.name,
      nickname: this.nickname().trim() || undefined
    };

    this.userClient.addPokemonToVault(user.id, pokemonData, this.selectedCollection())
      .subscribe({
        next: (updatedUser) => {
          // Actualizar usuario en auth y localStorage
          this.auth.activeUser.set(updatedUser);
          localStorage.setItem('activeUser', JSON.stringify(updatedUser));

          this.isLoading.set(false);
          this.captured.emit();
          this.close();
          alert(`¡${pkm.name} capturado exitosamente!`);
        },
        error: (error) => {
          console.error('Error al capturar Pokémon:', error);
          this.errorMessage.set('Error al capturar el Pokémon');
          this.isLoading.set(false);
        }
      });
  }
  getCollectionName(index: number): string {
    const user = this.usuario();
    const names = user?.collectionNames;
    const stored = names?.[index];

    if (stored && stored.trim().length > 0) {
      return stored.trim();
    }
    return `Colección ${index + 1}`;
  }

}
