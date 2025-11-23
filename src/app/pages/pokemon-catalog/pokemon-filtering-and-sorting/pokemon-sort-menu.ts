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
  <div class="sort-menu">
    <button
      class="filters-toggle"
      type="button"
      (click)="toggle()"
      aria-haspopup="true"
      [attr.aria-expanded]="open()"
    >
      Ordenar
      <span [class.open]="open()">▼</span>
    </button>

    <div class="dropdown-accordion" [class.open]="open()">
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
    </div>
  </div>
`,
  styles: [`
.sort-menu {
  display: block;
  margin: 0;
  max-width: none;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.8rem;
  color: #fff;
}

.filters-toggle {
  width: 100%;
  background: #2c2c2c;
  color: white;
  border: 3px solid #000;
  padding: 0.7rem 1rem;
  font-family: 'Press Start 2P', monospace;
  font-weight: bold;
  text-transform: uppercase;
  cursor: pointer;
  letter-spacing: 1px;
  box-shadow: 0 3px 0 #111;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
}

.filters-toggle span {
  transition: transform 0.25s ease;
}
.filters-toggle span.open {
  transform: rotate(180deg);
}

.dropdown-accordion {
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.25s ease;
}

.dropdown-accordion.open {
  max-height: 900px;
}

.dropdown {
  background: #1a1a1a;
  border: 3px solid #5f0b0b;
  padding: 8px;
  box-sizing: border-box;
  image-rendering: pixelated;
  margin-top: 0.5rem;
  width: 100%;
  max-width: none;

  min-height: 245px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.dropdown-inner {
margin-top: 0.5rem;
margin-bottom: 1rem;
  display: flex;
  gap: 8px;
  align-items: stretch;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.keys-col { flex: 1.5;
gap: 13px}
.dir-col  { flex: 1;
  gap :13px;}

.divider {
  width: 2px;
  background: repeating-linear-gradient(
    to bottom,
    #999 0px,
    #999 2px,
    transparent 2px,
    transparent 4px
  );
  align-self: stretch;
  margin: 0 4px;
}
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
  background: #ff0;
  border: 2px solid #000;
}
input[type="radio"]:checked + .radio-label {
  color: #ff0;
  text-shadow: 1px 1px 0 #000;
}

.radio-label { color: #fff; }


.actions button {
  background: #2c2c2c;
  color: white;
  border: 3px solid #000000;
  padding: 0.5rem 1rem;
  font-family: 'Press Start 2P', monospace;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 0 #1a1a1a;
  width: 50%;
}


.apply,
.clear {
  background: linear-gradient(180deg, #3a3a3a, #2d2d2d);
  color: #fff;
  border: 3px solid #1a1a1a;
  padding: 0.4rem 0.6rem;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 2px 2px 0 #1a1a1a;
  font-size: 0.85rem;
}
.apply[disabled],
.clear[disabled] {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 720px) {
  .sort-menu,
  .dropdown {
    max-width: 100%;
    margin-left: 0;
    margin-right: 0;
  }
  .dropdown { min-width: auto; }
}
@media (max-width: 520px) {
  .dropdown-inner { flex-direction: column; }
  .divider { display: none; }
}
`]
})

export class PokemonSortMenu {
  private readonly filterService = inject(PokemonFilterService);
  @Output() sorted = new EventEmitter<SortOption | null>();

  open = signal(false);
  closing = signal(false);

  readonly keys = [
    { value: 'id', label: 'Nro Pokedex' },
    { value: 'name', label: 'Nombre' },
    { value: 'generation', label: 'Generación' },
    { value: 'height', label: 'Altura' },
    { value: 'weight', label: 'Peso' }
  ] as const;

  readonly dirs = [
    { value: 'asc', label: 'Ascendente' },
    { value: 'desc', label: 'Descendente' }
  ] as const;

  selectedKey = signal<string>('');
  selectedDir = signal<string>('');

  currentSort = computed(() => this.filterService.currentSort());

  canApply = computed(() => !!this.selectedKey() && !!this.selectedDir());
  hasSort = computed(() => !!this.currentSort());

  // host reference for click-outside
  private hostEl = inject(ElementRef).nativeElement as HTMLElement;

  constructor() {
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


  toggle() {
    this.open.update(v => !v);
  }

}
