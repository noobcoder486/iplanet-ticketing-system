import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditRequestMasterComponent } from './credit-request-master.component';

describe('CreditRequestMasterComponent', () => {
  let component: CreditRequestMasterComponent;
  let fixture: ComponentFixture<CreditRequestMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreditRequestMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditRequestMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
