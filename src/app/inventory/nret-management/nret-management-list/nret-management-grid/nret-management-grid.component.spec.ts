import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NretManagementGridComponent } from './nret-management-grid.component';

describe('NretManagementGridComponent', () => {
  let component: NretManagementGridComponent;
  let fixture: ComponentFixture<NretManagementGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NretManagementGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NretManagementGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
