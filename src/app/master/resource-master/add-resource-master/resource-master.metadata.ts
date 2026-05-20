import { FormGroup } from "@angular/forms";

export class Resource {
    
    resourceForm: FormGroup;                                                                        
    ResourceCode: String;
    ResourceName: String;
    ResourceDescription: String;
    ResourceType: any;
    ProductCategory: String;
    DivisionCode:any;
    BaseUOM:any;
    SalesUOM:any;
  }