import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-confirm-modal',
    standalone: true,
    template: `
    @if (isOpen()) {
      <div class="overlay" (click)="onCancel()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="header">
            <div class="title">{{ title() }}</div>
            <button class="x" type="button" (click)="onCancel()">✕</button>
          </div>

          <div class="content">
            <p class="line">{{ message() }}</p>

            <div class="actions">
              <button class="btn primary" type="button" (click)="onConfirm()">
                {{ confirmText() }}
              </button>
              <button class="btn" type="button" (click)="onCancel()">
                {{ cancelText() }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
    styles: [` 
    .overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal {
  width: min(520px, 100%);
  background: linear-gradient(180deg, #2c2c2c, #262626);
  border: 4px solid #5f0b0b;
  box-shadow: inset 2px 2px 0 #3a3a3a, 8px 8px 0 #111;
  color: #fff;
  font-family: Inter, "Courier New", monospace;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 3px solid rgba(0, 0, 0, 0.6);
  background: linear-gradient(90deg, #3a3a3a, #2c2c2c);
}

.title {
  font-family: 'Press Start 2P', monospace;
  font-size: 1.0rem;
  letter-spacing: 1px;
  color: #ffd700;
  text-shadow: 3px 3px 0 #111;
  text-transform: uppercase;
}

.x {
  width: 36px;
  height: 36px;
  border: 3px solid #000;
  background: #d43030;
  color: #fff;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 3px 3px 0 #111;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.x:hover {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 #000;
}

.content {
  padding: 1rem 1rem 1.25rem;
}

.line {
  margin: 0 0 1rem 0;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.75rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.9);
}

.actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.2rem;
  border: 3px solid #000;
  background: linear-gradient(180deg, #3a3a3a, #2d2d2d);
  color: #fff;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.75rem;
  cursor: pointer;
  box-shadow: 3px 3px 0 #111;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.btn:hover {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 #000;
}

.btn.primary {
  background: linear-gradient(180deg, #ffd700, #f59e0b);
  color: #1a1a1a;
  border-color: #d97706;
  box-shadow: inset 1px 1px 0 #fef3c7, 3px 3px 0 #111;
}

    `],
})
export class ConfirmModalComponent {
    isOpen = input(false);
    title = input('Confirmar');
    message = input('¿Seguro?');
    confirmText = input('Aceptar');
    cancelText = input('Cancelar');

    confirmed = output<void>();
    cancelled = output<void>();

    onConfirm() {
        this.confirmed.emit();
    }

    onCancel() {
        this.cancelled.emit();
    }
}
