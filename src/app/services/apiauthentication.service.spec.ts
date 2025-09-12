import { TestBed } from '@angular/core/testing';

import { ApiauthenticationService } from './apiauthentication.service';

describe('ApiauthenticationService', () => {
  let service: ApiauthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiauthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
