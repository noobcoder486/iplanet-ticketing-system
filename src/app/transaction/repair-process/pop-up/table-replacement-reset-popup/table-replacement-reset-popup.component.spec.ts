import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableReplacementResetPopupComponent } from './table-replacement-reset-popup.component';

describe('TableReplacementResetPopupComponent', () => {
  let component: TableReplacementResetPopupComponent;
  let fixture: ComponentFixture<TableReplacementResetPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableReplacementResetPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableReplacementResetPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
