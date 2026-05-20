import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobroleMasterComponent } from './jobrole-master.component';

describe('JobroleMasterComponent', () => {
  let component: JobroleMasterComponent;
  let fixture: ComponentFixture<JobroleMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobroleMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobroleMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
