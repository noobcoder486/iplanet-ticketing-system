import { FormBuilder, FormGroup, Validators } from "@angular/forms";

export class Location {
    
    locationForm: FormGroup;                                                                        
    LocationAccGroupCode: String;
    LocationCode:number;
    LocationName: String;
    SearchName: String;
    Address1: String;
    Address2: String;
    City: String;
    ZipCode: number;
    StateCode: any;
    CountryCode: any;
    ContactPerson: String;
    MobileNo: number;
    PhoneNo:number;
    EmailId: String;
    TaxType: String;
    GSTRegistrationType: String;
    GSTRegistrationNo: any;
    PricingGroup: String;
    ShipToGSX: String;
    SoldToGSX: String;
    GSXDropOffCode: String;
    SAPStorageLocation: string
    SAPPlantCode: string
    ParentLocationCode: string
    ProfitCenterCode : string 
    Region:string
    GoogleMyBusiness:string
    AppleBusinessConnect:string
  }