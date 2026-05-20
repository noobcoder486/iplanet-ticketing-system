import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnsiteProcessListComponent } from './onsite-process-list.component';

describe('OnsiteProcessListComponent', () => {
  let component: OnsiteProcessListComponent;
  let fixture: ComponentFixture<OnsiteProcessListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnsiteProcessListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnsiteProcessListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
