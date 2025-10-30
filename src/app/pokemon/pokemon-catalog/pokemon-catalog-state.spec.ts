import { TestBed } from '@angular/core/testing';

import { PokemonCatalogState } from './pokemon-catalog-state';

describe('PokemonCatalogState', () => {
  let service: PokemonCatalogState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PokemonCatalogState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
