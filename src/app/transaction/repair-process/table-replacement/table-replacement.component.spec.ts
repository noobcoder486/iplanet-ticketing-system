import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableReplacementComponent } from './table-replacement.component';

describe('TableReplacementComponent', () => {
  let component: TableReplacementComponent;
  let fixture: ComponentFixture<TableReplacementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TableReplacementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TableReplacementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
