import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyStockManagementComponent } from './company-stock-management.component';

describe('CompanyStockManagementComponent', () => {
  let component: CompanyStockManagementComponent;
  let fixture: ComponentFixture<CompanyStockManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanyStockManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyStockManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
