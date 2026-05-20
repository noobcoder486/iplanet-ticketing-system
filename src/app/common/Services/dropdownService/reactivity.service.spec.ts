import { TestBed } from '@angular/core/testing';

import { ReactivityService } from './reactivity.service';

describe('ReactivityService', () => {
  let service: ReactivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReactivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
