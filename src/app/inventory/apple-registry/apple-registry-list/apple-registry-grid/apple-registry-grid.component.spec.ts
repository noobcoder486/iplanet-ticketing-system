import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppleRegistryGridComponent } from './apple-registry-grid.component';

describe('AppleRegistryGridComponent', () => {
  let component: AppleRegistryGridComponent;
  let fixture: ComponentFixture<AppleRegistryGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppleRegistryGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppleRegistryGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
