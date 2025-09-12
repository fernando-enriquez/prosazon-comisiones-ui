import { TestBed } from '@angular/core/testing';

import { DaterangeService } from './daterange.service';

describe('DaterangeService', () => {
  let service: DaterangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DaterangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
