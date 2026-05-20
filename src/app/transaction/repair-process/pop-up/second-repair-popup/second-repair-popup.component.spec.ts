import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondRepairPopupComponent } from './second-repair-popup.component';

describe('SecondRepairPopupComponent', () => {
  let component: SecondRepairPopupComponent;
  let fixture: ComponentFixture<SecondRepairPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SecondRepairPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondRepairPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
