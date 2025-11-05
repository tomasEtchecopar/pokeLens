import { TestBed } from '@angular/core/testing';

import { PokemonFiltersTranslation } from './pokemon-filters-translation';

describe('PokemonFiltersTranslation', () => {
  let service: PokemonFiltersTranslation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PokemonFiltersTranslation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
