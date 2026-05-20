import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobCreateSignatureComponent } from './job-create-signature.component';

describe('JobCreateSignatureComponent', () => {
  let component: JobCreateSignatureComponent;
  let fixture: ComponentFixture<JobCreateSignatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobCreateSignatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobCreateSignatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
