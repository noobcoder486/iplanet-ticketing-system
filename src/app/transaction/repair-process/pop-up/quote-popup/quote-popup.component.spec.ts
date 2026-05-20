import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotePopupComponent } from './quote-popup.component';

describe('QuotePopupComponent', () => {
  let component: QuotePopupComponent;
  let fixture: ComponentFixture<QuotePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuotePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
