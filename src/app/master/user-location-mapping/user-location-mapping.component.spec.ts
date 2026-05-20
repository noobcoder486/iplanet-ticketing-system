import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLocationMappingComponent } from './user-location-mapping.component';

describe('UserLocationMappingComponent', () => {
  let component: UserLocationMappingComponent;
  let fixture: ComponentFixture<UserLocationMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserLocationMappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserLocationMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
