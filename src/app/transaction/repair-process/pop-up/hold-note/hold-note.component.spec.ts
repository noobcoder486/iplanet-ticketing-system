import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldNoteComponent } from './hold-note.component';

describe('HoldNoteComponent', () => {
  let component: HoldNoteComponent;
  let fixture: ComponentFixture<HoldNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HoldNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HoldNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
