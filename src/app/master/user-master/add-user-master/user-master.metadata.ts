import { FormGroup } from "@angular/forms";

export class User {
    userForm: FormGroup;
    UserName: String;
    Password: String;
    FirstName: String;
    LastName: String;
    PrimaryEmail: String;
    Status : String;
    MobileNo : String;
    JobRole : String;
    MenuGroup:string;
    OrgRole :string;
    TimeZone: String;
    Language: String;
    DefaultCompany:string;
    Signature : String;
    AddressLine1 :String;
    AddressLine2 : String;
    AddressCity : String;
    AddressStateCode : string;
    AddressPostalCode : String;
    AddressCountry : string;
    ImageName : String;
    GSXIdFlag : string;
    GsxUserId : string;
    GSXTechId : string;
    UploadedImageLists: any[] = [];
    BaseLocationCode :string;
    EmployeeCode:string;
  }