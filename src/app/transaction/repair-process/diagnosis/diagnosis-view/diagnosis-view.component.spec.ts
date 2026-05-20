import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosisViewComponent } from './diagnosis-view.component';

describe('DiagnosisViewComponent', () => {
  let component: DiagnosisViewComponent;
  let fixture: ComponentFixture<DiagnosisViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiagnosisViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiagnosisViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
