import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsignmentScanComponent } from './consignment-scan.component';

describe('ConsignmentScanComponent', () => {
  let component: ConsignmentScanComponent;
  let fixture: ComponentFixture<ConsignmentScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsignmentScanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsignmentScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
