import { TestBed } from '@angular/core/testing';

import { PokemonCatalogSearch } from './pokemon-catalog-search';

describe('PokemonCatalogSearch', () => {
  let service: PokemonCatalogSearch;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PokemonCatalogSearch);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
