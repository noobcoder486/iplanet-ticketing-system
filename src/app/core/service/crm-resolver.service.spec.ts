import { TestBed } from '@angular/core/testing';

import { CrmResolverService } from './crm-resolver.service';

describe('CrmResolverService', () => {
  let service: CrmResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrmResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
