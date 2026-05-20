import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetQuotePopupComponent } from './reset-quote-popup.component';

describe('ResetQuotePopupComponent', () => {
  let component: ResetQuotePopupComponent;
  let fixture: ComponentFixture<ResetQuotePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResetQuotePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetQuotePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
