import { TestBed } from '@angular/core/testing';

import { AuthjwtGuardService } from './authjwt-guard.service';

describe('AuthjwtGuardService', () => {
  let service: AuthjwtGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthjwtGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
