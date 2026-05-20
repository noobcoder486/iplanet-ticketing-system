import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundListGridComponent } from './refund-list-grid.component';

describe('RefundListGridComponent', () => {
  let component: RefundListGridComponent;
  let fixture: ComponentFixture<RefundListGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefundListGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefundListGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
