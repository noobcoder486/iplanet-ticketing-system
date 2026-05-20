import { TestBed } from '@angular/core/testing';

import { GsxService } from './gsx.service';

describe('GsxService', () => {
  let service: GsxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GsxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
