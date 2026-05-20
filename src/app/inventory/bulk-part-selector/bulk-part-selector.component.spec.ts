import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkPartSelectorComponent } from './bulk-part-selector.component';

describe('BulkPartSelectorComponent', () => {
  let component: BulkPartSelectorComponent;
  let fixture: ComponentFixture<BulkPartSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BulkPartSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkPartSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
