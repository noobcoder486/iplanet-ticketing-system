import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalespersonMasterComponent } from './salesperson-master.component';

describe('SalespersonMasterComponent', () => {
  let component: SalespersonMasterComponent;
  let fixture: ComponentFixture<SalespersonMasterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalespersonMasterComponent]
    });
    fixture = TestBed.createComponent(SalespersonMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
