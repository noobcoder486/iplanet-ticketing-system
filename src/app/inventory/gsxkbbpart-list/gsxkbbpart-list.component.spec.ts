import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GsxkbbpartListComponent } from './gsxkbbpart-list.component';

describe('GsxkbbpartListComponent', () => {
  let component: GsxkbbpartListComponent;
  let fixture: ComponentFixture<GsxkbbpartListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GsxkbbpartListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GsxkbbpartListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
