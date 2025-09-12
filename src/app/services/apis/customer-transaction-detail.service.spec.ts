import { TestBed } from '@angular/core/testing';

import { CustomerTransactionDetailService } from './customer-transaction-detail.service';

describe('CustomerTransactionDetailService', () => {
  let service: CustomerTransactionDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerTransactionDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
