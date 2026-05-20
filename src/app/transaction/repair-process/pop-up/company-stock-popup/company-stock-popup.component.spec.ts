import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyStockPopupComponent } from './company-stock-popup.component';

describe('CompanyStockPopupComponent', () => {
  let component: CompanyStockPopupComponent;
  let fixture: ComponentFixture<CompanyStockPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanyStockPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyStockPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
