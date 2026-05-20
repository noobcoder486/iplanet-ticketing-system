import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HappyCallingListComponent } from './happy-calling-list.component';

describe('HappyCallingListComponent', () => {
  let component: HappyCallingListComponent;
  let fixture: ComponentFixture<HappyCallingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HappyCallingListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HappyCallingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
