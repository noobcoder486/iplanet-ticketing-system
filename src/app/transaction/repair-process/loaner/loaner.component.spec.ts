import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanerComponent } from './loaner.component';

describe('LoanerComponent', () => {
  let component: LoanerComponent;
  let fixture: ComponentFixture<LoanerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoanerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
