import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkReturnGridComponent } from './bulk-return-grid.component';

describe('BulkReturnGridComponent', () => {
  let component: BulkReturnGridComponent;
  let fixture: ComponentFixture<BulkReturnGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkReturnGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkReturnGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
