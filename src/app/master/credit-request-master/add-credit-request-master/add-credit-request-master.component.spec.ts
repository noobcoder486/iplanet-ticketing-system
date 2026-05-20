import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCreditRequestMasterComponent } from './add-credit-request-master.component';

describe('AddCreditRequestMasterComponent', () => {
  let component: AddCreditRequestMasterComponent;
  let fixture: ComponentFixture<AddCreditRequestMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCreditRequestMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCreditRequestMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
