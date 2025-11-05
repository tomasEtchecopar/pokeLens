import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonFilterDropdown } from './pokemon-filter-dropdown';

describe('PokemonFilterDropdown', () => {
  let component: PokemonFilterDropdown;
  let fixture: ComponentFixture<PokemonFilterDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonFilterDropdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonFilterDropdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
