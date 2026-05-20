import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCompanyMaterialResourceMappingComponent } from './add-company-material-resource-mapping.component';

describe('AddCompanyMaterialResourceMappingComponent', () => {
  let component: AddCompanyMaterialResourceMappingComponent;
  let fixture: ComponentFixture<AddCompanyMaterialResourceMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCompanyMaterialResourceMappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCompanyMaterialResourceMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
