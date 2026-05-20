import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundCreatedListGridComponent } from './refund-created-list-grid.component';

describe('RefundCreatedListGridComponent', () => {
  let component: RefundCreatedListGridComponent;
  let fixture: ComponentFixture<RefundCreatedListGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefundCreatedListGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefundCreatedListGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
