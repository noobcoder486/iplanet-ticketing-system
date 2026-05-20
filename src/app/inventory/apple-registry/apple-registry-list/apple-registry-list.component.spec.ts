import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppleRegistryListComponent } from './apple-registry-list.component';

describe('AppleRegistryListComponent', () => {
  let component: AppleRegistryListComponent;
  let fixture: ComponentFixture<AppleRegistryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppleRegistryListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppleRegistryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
