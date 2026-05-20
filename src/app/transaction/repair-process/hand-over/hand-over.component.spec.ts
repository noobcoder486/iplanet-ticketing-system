import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandOverComponent } from './hand-over.component';

describe('HandOverComponent', () => {
  let component: HandOverComponent;
  let fixture: ComponentFixture<HandOverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HandOverComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HandOverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
