import { TestBed } from '@angular/core/testing';

import { ApinayarbotService } from './northwareUtils.service';

describe('ApinayarbotService', () => {
  let service: ApinayarbotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApinayarbotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
