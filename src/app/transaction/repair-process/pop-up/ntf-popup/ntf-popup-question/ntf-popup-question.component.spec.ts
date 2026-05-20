import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NtfPopupQuestionComponent } from './ntf-popup-question.component';

describe('NtfPopupQuestionComponent', () => {
  let component: NtfPopupQuestionComponent;
  let fixture: ComponentFixture<NtfPopupQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NtfPopupQuestionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NtfPopupQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
