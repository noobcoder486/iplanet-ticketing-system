import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToteManagementComponent } from './tote-management.component';

describe('ToteManagementComponent', () => {
  let component: ToteManagementComponent;
  let fixture: ComponentFixture<ToteManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToteManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToteManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
