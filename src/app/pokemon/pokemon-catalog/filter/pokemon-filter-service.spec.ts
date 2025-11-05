import { TestBed } from '@angular/core/testing';

import { PokemonFilterService} from './pokemon-filter-service';

describe('PokemonFilterService', () => {
  let service: PokemonFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PokemonFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
