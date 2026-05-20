import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectNoteComponent } from './reject-note.component';

describe('RejectNoteComponent', () => {
  let component: RejectNoteComponent;
  let fixture: ComponentFixture<RejectNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RejectNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
