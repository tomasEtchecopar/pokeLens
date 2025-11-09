import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonCatalog } from './pokemon-catalog';

describe('PokemonCatalog', () => {
  let component: PokemonCatalog;
  let fixture: ComponentFixture<PokemonCatalog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonCatalog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonCatalog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
