import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContractMasterComponent } from './add-contract-master.component';

describe('AddContractMasterComponent', () => {
  let component: AddContractMasterComponent;
  let fixture: ComponentFixture<AddContractMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddContractMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddContractMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
