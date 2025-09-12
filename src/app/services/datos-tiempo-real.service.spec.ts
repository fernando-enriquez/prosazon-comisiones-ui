import { TestBed } from '@angular/core/testing';

import { DatosTiempoRealService } from './datos-tiempo-real.service';

describe('DatosTiempoRealService', () => {
  let service: DatosTiempoRealService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DatosTiempoRealService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
