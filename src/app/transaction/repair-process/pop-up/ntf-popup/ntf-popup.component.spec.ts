import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NtfPopupComponent } from './ntf-popup.component';

describe('NtfPopupComponent', () => {
  let component: NtfPopupComponent;
  let fixture: ComponentFixture<NtfPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NtfPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NtfPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
