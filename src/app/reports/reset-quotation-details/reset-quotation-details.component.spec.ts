import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetQuotationDetailsComponent } from './reset-quotation-details.component';

describe('ResetQuotationDetailsComponent', () => {
  let component: ResetQuotationDetailsComponent;
  let fixture: ComponentFixture<ResetQuotationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResetQuotationDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetQuotationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
