import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSalespersonMasterComponent } from './add-salesperson-master.component';

describe('AddSalespersonMasterComponent', () => {
  let component: AddSalespersonMasterComponent;
  let fixture: ComponentFixture<AddSalespersonMasterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddSalespersonMasterComponent]
    });
    fixture = TestBed.createComponent(AddSalespersonMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
