import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashDepositListComponent } from './cash-deposit-list.component';

describe('CashDepositListComponent', () => {
  let component: CashDepositListComponent;
  let fixture: ComponentFixture<CashDepositListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashDepositListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashDepositListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
