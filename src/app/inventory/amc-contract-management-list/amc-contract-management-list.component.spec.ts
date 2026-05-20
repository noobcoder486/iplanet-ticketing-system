import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmcContractManagementListComponent } from './amc-contract-management-list.component';

describe('AmcContractManagementListComponent', () => {
  let component: AmcContractManagementListComponent;
  let fixture: ComponentFixture<AmcContractManagementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmcContractManagementListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AmcContractManagementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
