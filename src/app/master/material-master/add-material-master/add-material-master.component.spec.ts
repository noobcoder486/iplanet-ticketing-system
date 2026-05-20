import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMaterialMasterComponent } from './add-material-master.component';

describe('AddMaterialMasterComponent', () => {
  let component: AddMaterialMasterComponent;
  let fixture: ComponentFixture<AddMaterialMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMaterialMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMaterialMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
