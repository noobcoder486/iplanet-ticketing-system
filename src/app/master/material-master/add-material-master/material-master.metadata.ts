import { FormGroup } from "@angular/forms";

export class Material {
    materialForm: FormGroup;                                                                        
    MaterialCode: String;
    MaterialName: String;
    MaterialDescription: String;
    PriceGroup: string
    PartType: any;
    LaborTier: any;
    EEECode: String;
    MarginPercentage: number;
    SubstitutePart: String;
    ComponentGroup: any;
    SerializedModule: boolean;
    ERPMaterialCode: String;
    GSTRegistration: any;
    DivisionCode:any;
    BaseUOM:any;
    SalesUOM:any;
    ItemType:any;
    ERPSerialized: boolean;
    RevenueType: string;
    CostPrice: number;
    isDeleted: boolean;
    MatGroup1: string;
    MatGroup2: string;
    MatGroup3: string;
    MatGroup4: string;
    Brand:string;
    MatCategory:string;
       PriceSource:string;
    IsMarginPriceApplicable:boolean;
  }