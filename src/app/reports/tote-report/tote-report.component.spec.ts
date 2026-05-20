import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToteReportComponent } from './tote-report.component';

describe('ToteReportComponent', () => {
  let component: ToteReportComponent;
  let fixture: ComponentFixture<ToteReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToteReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToteReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
