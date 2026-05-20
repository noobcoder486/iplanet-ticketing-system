import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HappyCallingComponent } from './happy-calling.component';

describe('HappyCallingComponent', () => {
  let component: HappyCallingComponent;
  let fixture: ComponentFixture<HappyCallingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HappyCallingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HappyCallingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
