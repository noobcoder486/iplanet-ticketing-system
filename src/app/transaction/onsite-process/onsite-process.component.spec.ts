import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnsiteProcessComponent } from './onsite-process.component';

describe('OnsiteProcessComponent', () => {
  let component: OnsiteProcessComponent;
  let fixture: ComponentFixture<OnsiteProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnsiteProcessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnsiteProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
