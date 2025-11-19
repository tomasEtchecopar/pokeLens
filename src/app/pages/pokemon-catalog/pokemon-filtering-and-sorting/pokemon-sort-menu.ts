import { Component, ElementRef, EventEmitter, HostListener, inject, Output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PokemonFilterService } from './pokemon-filter-service';
import { SortOption } from '../../../pokemon/models/pokemon-sort';

@Component({
  selector: 'pokemon-sort-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sort-menu" #root>
      <button class="sort-button" type="button" (click)="toggle()" aria-haspopup="true" [attr.aria-expanded]="open()">
        Ordenar ▾
      </button>

      @if(open()) {
      <div class="dropdown" role="dialog" aria-label="Menu de ordenamiento">
        <div class="dropdown-inner">
          <div class="col keys-col" role="radiogroup" aria-label="Orden por">
            @for (k of keys; track k.value) {
            <label class="radio-row" title="{{k.label}}">
              <input
                type="radio"
                name="sort-key"
                [value]="k.value"
                [checked]="selectedKey() === k.value"
                (change)="selectKey(k.value)"
              />
              <span class="radio-label">{{ k.label }}</span>
            </label>
            }
          </div>

          <div class="divider" aria-hidden="true"></div>

          <div class="col dir-col" role="radiogroup" aria-label="Dirección">
            @for (d of dirs; track d.value) {
            <label class="radio-row">
              <input
                type="radio"
                name="sort-dir"
                [value]="d.value"
                [checked]="selectedDir() === d.value"
                (change)="selectDir(d.value)"
              />
              <span class="radio-label">{{ d.label }}</span>
            </label>
            }
          </div>
        </div>

        <div class="actions">
          <button class="apply" (click)="apply()" [disabled]="!canApply()">Aplicar</button>
          <button class="clear" (click)="clear()" [disabled]="!hasSort()">Limpiar</button>
        </div>
      </div>
      }
    </div>
  `,
styles: [`
.sort-menu { position: relative; display: inline-block; font-family: 'Press Start 2P', monospace; font-size: 0.8rem; color: #fff; }

/* Botón principal: revertido al original */
.sort-button {
  background: linear-gradient(180deg,#3a3a3a,#2d2d2d);
  color: #FFF;
  border: 3px solid #1a1a1a;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  box-shadow: 2px 2px 0 #1a1a1a;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.85rem;
}

/* Contenedor desplegable: como un sprite框 */
.dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  background: linear-gradient(180deg, #2c2c2c 0%, #262626 100%);
  border: 4px solid #f00; /* red border like game UI */
  min-width: 320px;
  z-index: 100;
  padding: 8px;
  box-sizing: border-box;
  image-rendering: pixelated;
}

/* Layout interno: grid-like */
.dropdown-inner { display: flex; gap: 8px; align-items: stretch; }
.col { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.keys-col { flex: 1.5; } .dir-col { flex: 1; }

/* Divider: simple dotted line */
.divider {
  width: 2px;
  background: repeating-linear-gradient(to bottom, #999 0px, #999 2px, transparent 2px, transparent 4px);
  align-self: stretch;
  margin: 0 4px;
}

/* Fila radio: blocky hover */
.radio-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: #333;
  cursor: pointer;
  user-select: none;
}
.radio-row:hover {
  background: #666;
}

/* Radios: pixel art squares */
input[type="radio"] {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid #000;
  background: #333;
  position: relative;
  image-rendering: pixelated;
}
input[type="radio"]:checked {
  background: #ff0; /* yellow fill */
  border: 2px solid #000;
}
input[type="radio"]:checked + .radio-label {
  color: #ff0;
  text-shadow: 1px 1px 0 #000; /* pixel shadow for relief */
}

/* Leyenda: pixel font */
.radio-label {
  color: #fff;
}

/* Acciones: botones revertidos al original */
.actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
.apply, .clear {
  background: linear-gradient(180deg,#3a3a3a,#2d2d2d);
  color: #fff;
  border: 3px solid #1a1a1a;
  padding: 0.4rem 0.6rem;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 2px 2px 0 #1a1a1a;
  font-size: 0.85rem;
}
.apply[disabled], .clear[disabled] { opacity: 0.45; cursor: not-allowed; }

/* Responsive: keep it simple, 8-bit didn't resize much */
@media (max-width: 720px) { .dropdown { min-width: 280px; } }
@media (max-width: 520px) { .dropdown-inner { flex-direction: column; } .divider { display: none; } }
`]
})



export class PokemonSortMenu {
  private readonly filterService = inject(PokemonFilterService);
  @Output() sorted = new EventEmitter<SortOption | null>();

  // botón desplegable abierto?
  open = signal(false);

  // opciones keys (coinciden con SortKey)
  readonly keys = [
    { value: 'id', label: 'ID' },
    { value: 'name', label: 'Nombre' },
    { value: 'generation', label: 'Generación' },
    { value: 'height', label: 'Altura' },
    { value: 'weight', label: 'Peso' }
  ] as const;

  // opciones direcciones
  readonly dirs = [
    { value: 'asc', label: 'Ascendente' },
    { value: 'desc', label: 'Descendente' }
  ] as const;

  // estados seleccionados
  selectedKey = signal<string>('');
  selectedDir = signal<string>('');

  currentSort = computed(() => this.filterService.currentSort());

  canApply = computed(() => !!this.selectedKey() && !!this.selectedDir());
  hasSort = computed(() => !!this.currentSort());

  // referencia host para click-outside
  private hostEl = inject(ElementRef).nativeElement as HTMLElement;

  constructor(){
    // sync local selects when external sort changes
    effect(() => {
      const s = this.currentSort();
      if (!s) {
        this.selectedKey.set('');
        this.selectedDir.set('');
      } else {
        this.selectedKey.set(s.key ?? '');
        this.selectedDir.set(s.dir ?? '');
      }
    });
  }

  toggle() {
    this.open.update(v => !v);
  }

  selectKey(v: string) {
    this.selectedKey.set(v ?? '');
    if (!v) this.selectedDir.set('');
  }

  selectDir(v: string) {
    this.selectedDir.set(v ?? '');
  }

  apply() {
    const k = this.selectedKey();
    const d = this.selectedDir() as 'asc' | 'desc' | '';
    if (!k || !d) return;
    const opt: SortOption = { key: k as any, dir: d as 'asc' | 'desc' };
    this.filterService.setSort(opt);
    this.sorted.emit(opt);
    this.open.set(false);
  }

  clear() {
    this.filterService.setSort(null);
    this.sorted.emit(null);
    this.selectedKey.set('');
    this.selectedDir.set('');
    this.open.set(false);
  }

  // click-outside to close (HostListener modern)
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    if (!this.hostEl.contains(ev.target as Node)) this.open.set(false);
  }
}
