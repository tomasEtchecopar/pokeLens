import { TestBed } from '@angular/core/testing';

import { PokemonCatalogFilter } from './pokemon-catalog-filter';

describe('PokemonCatalogFilter', () => {
  let service: PokemonCatalogFilter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PokemonCatalogFilter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
