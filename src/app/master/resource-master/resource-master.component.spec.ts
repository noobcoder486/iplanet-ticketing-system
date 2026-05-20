import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceMasterComponent } from './resource-master.component';

describe('ResourceMasterComponent', () => {
  let component: ResourceMasterComponent;
  let fixture: ComponentFixture<ResourceMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResourceMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
