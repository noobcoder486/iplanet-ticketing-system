import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractMasterComponent } from './contract-master.component';

describe('ContractMasterComponent', () => {
  let component: ContractMasterComponent;
  let fixture: ComponentFixture<ContractMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContractMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
