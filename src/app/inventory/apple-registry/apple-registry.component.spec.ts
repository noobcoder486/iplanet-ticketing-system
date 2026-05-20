import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppleRegistryComponent } from './apple-registry.component';

describe('AppleRegistryComponent', () => {
  let component: AppleRegistryComponent;
  let fixture: ComponentFixture<AppleRegistryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppleRegistryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppleRegistryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
