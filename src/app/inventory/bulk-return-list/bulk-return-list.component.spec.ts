import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkReturnListComponent } from './bulk-return-list.component';

describe('BulkReturnListComponent', () => {
  let component: BulkReturnListComponent;
  let fixture: ComponentFixture<BulkReturnListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkReturnListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkReturnListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
