import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonCollections } from './pokemon-collections';

describe('PokemonCollections', () => {
  let component: PokemonCollections;
  let fixture: ComponentFixture<PokemonCollections>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonCollections]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonCollections);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
