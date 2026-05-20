import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NretManagementListComponent } from './nret-management-list.component';

describe('NretManagementListComponent', () => {
  let component: NretManagementListComponent;
  let fixture: ComponentFixture<NretManagementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NretManagementListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NretManagementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
