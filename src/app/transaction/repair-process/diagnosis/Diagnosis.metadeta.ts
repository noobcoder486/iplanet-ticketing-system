import { Diag } from "../repair-process.metadata";

export class DignosisMetaData{
    DiagnosisGUID:String;
    CaseGuid:String;
    CaseId:String;
    DiagnosisCode:String;
    DiagnosisDate:Date;    
    BillingOption:String;
    BillingOptionDesc:String;
    LaborCovered:boolean;
    ServiceNRepairType: string;
    PartsCovered:boolean;  
    RepairType:String;
    RepairTypeDesc:String;
    DiagStatus:String;
    SubmissionType:String;
    SubmissionTypeDesc:String;
    NoOfDays: Number;
    CompanyName: string;
    NoOfDaysDesc: String;
    BillableRepair:boolean;
    PaymentTerms:String;
    SelectedComponentIssue: any[] = [];
    UploadedImageList: any[] = [];
    InputMode:String;
  }