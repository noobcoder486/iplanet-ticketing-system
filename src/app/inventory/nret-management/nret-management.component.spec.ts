import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NretManagementComponent } from './nret-management.component';

describe('NretManagementComponent', () => {
  let component: NretManagementComponent;
  let fixture: ComponentFixture<NretManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NretManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NretManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
