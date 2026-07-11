import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableReplacementDetailReportComponent } from './table-replacement-detail-report.component';

describe('TableReplacementDetailReportComponent', () => {
  let component: TableReplacementDetailReportComponent;
  let fixture: ComponentFixture<TableReplacementDetailReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableReplacementDetailReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableReplacementDetailReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
