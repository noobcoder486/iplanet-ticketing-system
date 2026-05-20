import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetDiagnosisPopupComponent } from './reset-diagnosis-popup.component';

describe('ResetDiagnosisPopupComponent', () => {
  let component: ResetDiagnosisPopupComponent;
  let fixture: ComponentFixture<ResetDiagnosisPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResetDiagnosisPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetDiagnosisPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
