import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteApproverComponent } from './quote-approver.component';

describe('QuoteApproverComponent', () => {
  let component: QuoteApproverComponent;
  let fixture: ComponentFixture<QuoteApproverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuoteApproverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteApproverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
