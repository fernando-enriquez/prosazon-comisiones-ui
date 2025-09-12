import { TestBed } from '@angular/core/testing';

import { AtributosServiceService } from './atributos-service.service';

describe('AtributosServiceService', () => {
  let service: AtributosServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AtributosServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
