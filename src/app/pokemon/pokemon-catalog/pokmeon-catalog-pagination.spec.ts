import { TestBed } from '@angular/core/testing';

import { PokmeonCatalogPagination } from './pokmeon-catalog-pagination';

describe('PokmeonCatalogPagination', () => {
  let service: PokmeonCatalogPagination;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PokmeonCatalogPagination);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
