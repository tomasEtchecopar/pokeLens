import { TestBed } from '@angular/core/testing';

import { PokeGuessService } from './poke-guess-service';

describe('PokeGuessService', () => {
  let service: PokeGuessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PokeGuessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
