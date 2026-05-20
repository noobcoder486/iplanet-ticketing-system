import { TestBed } from '@angular/core/testing';

import { RowdataService } from './rowdata.service';

describe('RowdataService', () => {
  let service: RowdataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RowdataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
