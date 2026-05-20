import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosisPopupComponent } from './diagnosis-popup.component';

describe('DiagnosisPopupComponent', () => {
  let component: DiagnosisPopupComponent;
  let fixture: ComponentFixture<DiagnosisPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiagnosisPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagnosisPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
