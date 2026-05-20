import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserLocationMappingComponent } from './add-user-location-mapping.component';

describe('AddUserLocationMappingComponent', () => {
  let component: AddUserLocationMappingComponent;
  let fixture: ComponentFixture<AddUserLocationMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUserLocationMappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUserLocationMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
