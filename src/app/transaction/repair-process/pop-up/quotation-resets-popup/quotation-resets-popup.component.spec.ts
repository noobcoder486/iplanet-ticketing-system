import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationResetsPopupComponent } from './quotation-resets-popup.component';

describe('QuotationResetsPopupComponent', () => {
  let component: QuotationResetsPopupComponent;
  let fixture: ComponentFixture<QuotationResetsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuotationResetsPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotationResetsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
