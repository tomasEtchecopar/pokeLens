import { TestBed } from '@angular/core/testing';
import { PokemonCatalogPagination } from './pokemon-catalog-pagination';


describe('PokmeonCatalogPagination', () => {
  let service: PokemonCatalogPagination;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PokemonCatalogPagination);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
