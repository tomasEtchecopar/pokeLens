import { Component, input, output, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-nickname-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (isOpen()) {
      <div class="modal-overlay" (click)="cancel()">
        <div class="modal-content" (click)="$event.stopPropagation()">

          <div class="modal-header">
            <h3>{{ title() }}</h3>
            <button class="close-btn" type="button" (click)="cancel()">✕</button>
          </div>

          <div class="modal-body">
            <p class="helper">{{ message() }}</p>

            <div class="form-group">
              <label for="nickname">Apodo (opcional):</label>
              <input
                id="nickname"
                type="text"
                [(ngModel)]="draft"
                maxlength="32"
                placeholder="Ej: Mi campeón"
                (keyup.enter)="save()"
                autofocus
              />
            </div>

            @if (error()) {
              <p class="error-message">{{ error() }}</p>
            }

            <div class="modal-actions">
              <button class="btn-cancel" type="button" (click)="cancel()">Cancelar</button>
              <button class="btn-capture" type="button" (click)="save()">Guardar</button>
            </div>
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    /* ✅ Reusamos el MISMO look de AddPokemonModal */

    .modal-overlay {
      position: fixed;
      top: 0; left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
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
      from { transform: translateY(-50px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
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

    .modal-body { padding: 1.5rem; }

    .helper {
      margin: 0 0 1rem 0;
      color: rgba(255,255,255,0.9);
      font-weight: 700;
    }

    .form-group { margin-bottom: 1.25rem; }

    .form-group label {
      display: block;
      color: #ffd700;
      font-weight: 700;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem;
      background: #1a1a1a;
      border: 2px solid #3a3a3a;
      color: #fff;
      font-size: 1rem;
      font-family: 'Courier New', monospace;
      box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.5);
      box-sizing: border-box;
    }

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
      background: linear-gradient(180deg, #ffd700, #f59e0b);
      color: #1a1a1a;
    }

    .btn-capture:hover {
      background: linear-gradient(180deg, #ffe680, #ffd700);
      transform: translate(1px, 1px);
    }
  `]
})
export class EditNicknameModalComponent {
  isOpen = input(false);
  title = input('Editar apodo');
  message = input('Ingresá el nuevo apodo');
  initialValue = input('');

  saved = output<string>();
  cancelled = output<void>();

  draft = '';
  error = signal<string>('');

  constructor() {
    // cuando se abre, precargar el valor
    effect(() => {
      if (this.isOpen()) {
        this.draft = this.initialValue() ?? '';
        this.error.set('');
      }
    });
  }

  save() {
    const trimmed = (this.draft ?? '').trim();
    if (trimmed.length > 32) {
      this.error.set('El apodo no puede exceder 32 caracteres');
      return;
    }
    this.saved.emit(trimmed);
  }

  cancel() {
    this.cancelled.emit();
  }
}
