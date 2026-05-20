
export class CaseDetail {
    UpdatedType:              String;
    CaseGUID:                 string;
    JobHeaderGuid:            string;
    CaseId:                   string;
    CaseDate:                 Date;
    JobType:                  string;
    CompanyCode:              string;
    LocationCode:             string;
    LOCATION :                any;
    SerialNo1:                string;
    imei:                     string;
    meid:                     string;
    ProductType:              string;
    productDescription:       string;
    ConfigurationCode:        string;
    ConfigurationDescription: string;
    purchaseCountryCode:      string;
    TableReplacement:         string;
    PurchaseCountryDesc:      string;
    RetailCustomerCode:       string;
    soldToName:               string;
    ActivationDate:           Date;
    GSXWarrantyStatusCode:    string;
    GSXWarrantyStatusDesc:    string;
    CoverageStartdate:        Date;
    CoverageEndDate:          Date;
    deviceCoverageDetails:    string;
    ElsStatus:                string;
    ProductImageURL:          string;
    ComplainDesc:             string;
    Remark:                   string;
    JobStatus:                string;
    BillingOption:            string;
    PartCovered:              any;
    LaborCovered:             any;
    ElsStatusDesc:            any;
    JobTypeDesc:              any;
    JobStatusDesc:            any;            
    AssignTechFlag:           any;
    DiagFlag:                 any;
    RepairFlag:               any;
    QuoteFlag:                any;
    InvoiceFlag:              any;
    RFPFlag:                  any;
    HandoverFlag:             any;
    DiagGUID:                 string;
    RepairGUID:               string;
    QuoteGUID:                string;
    InvoiceGUID:              string;
    AssignTechGUID:           string;
    HandoverGUID:             string;
    CreatedBy:                string;
    CreatedDate:              Date;
    LastUpdatedBy:            string;
    LastUpdatedDate:          Date;
    IsDeleted:                string;
    CUSTOMER:                 Customer;
    DIAG:                     Diag;
    PaymentLinkList:          any;
    REPAIR:                   any;
    ASGTECH:                  Asgtech;
    QUOTE:                    any;
    repairPartList:           any[] = [];
    quotePartList:            any[] = [];
    repairViewComponentIssues:any[] = [];
    PAYMENTLIST:              Payment;
    RFP:                      Rfp;
    HANDOVER:                 HandOver;
    NOTESLIST :               Notes;
    HOLDLIST :                Hold;
    UNCLAIMED :           Unclaimed;
    INVOICE:                  any;
    JOBATTACHMENT:            any;
    COMMDETAILS:              any;
    REPAIRLOGS:               any;
    CASADETAILS:               any;
    GSXMARKDOWNLIST:          any;
  ApprovedBy: any;
  IsContractApplicable: boolean;
  ContractStartDate: any;
  ContractEndDate: any;
  ContractCode: any;
  ContractCodeObject: any;
  QuotationResetsList: any;
   TableReplacementReplenish:any;
  TableReplacementStock:any
}

export class Asgtech {
    AssignTechGUID: string;
    CompanyCode:    string;
    TechCode:       string;
    CaseGUID:       string;
    Remark:         string;
    AssignDate:     Date;
    CreatedBy:      string;
    CreatedDate:    Date;
}

export class Customer {
    CustAccGroupCode:    string;
    CompanyCode:         string;
    CustomerCode:        string;
    FirstName:           string;
    LastName:            string;
    Blocked:             string;
    Address1:            string;
    Address2:            string;
    CountryCode:         string;
    StateCode:           string;
    City:                string;
    ZipCode:             string;
    MobileNo:            string;
    PhoneNo:             string;
    EmailID:             string;
    TaxType:             string;
    GSTRegistrationNo:   string;
    GSTRegistrationType: string;
    DefaultPartnerCode:  string;
    BillToCustomerCode:  string;
    PriceGroup:          string;
    CreatedBy:           string;
    CreatedDate:         Date;
    LastUpdatedBy:       string;
    LastUpdatedDate:     Date;
    CountryName:         string;
    StateName:           string;
    IsInsuranceApplicable: any;

}

export class Diag {
    CompanyCode:            string;
    CompanyName:            string;
    DiagnosisGUID:          string;
    CaseGUID:               string;
    DiagnosisCode:          string;
    DiagnosisDate:          Date;
    DiagnosisStatus:        string;
    SubmissionType:         string;
    SubmissionTypeDesc:     string;
    ServiceNRepairType:     string;
    SubmissionDateTime:     Date;
    NoOfDaysToComplete:     Number;
    NoOfDaysToCompleteDesc: String;
    RepairType:             string;
    RepairTypeDesc:         string;
    BillingOption:          string;
    BillingOptionDescription:      string;
    PaymentTerms:           string;
    PartsCovered:           boolean;
    LaborCovered:           boolean;
    BillableRepair:         number;
    Remark:                 string;
    CustomerCompanyName:    string;
    GSXCode:                string;
    CreatedBy:              string;
    LastUpdatedBy:          string;
    CreatedDate:            Date;
    LastUpdatedDate:        Date;
    IsDeleted:              boolean;
    DIAGLIST:               Diaglist;
    DIAGATTACHMENT: DIAGATTACHMENT;
}

export class Diaglist {
    DIAGDETAIL: Diagdetail[];
}



export class Diagdetail {
    DiagnosisDetailGUID: string;
    DiagnosisGUID:       string;
    ComponentCode:       string;
    ComponentDesc:       string;
    IssueCode:           string;
    IssueDesc:           string;
    ReproducibilityDescription: string;
    ReproducibilityCode: string;
    CreatedBy:           string;
    LastupdatedBy:       string;
    CreatedDate:         Date;
    LastupdatedDate:     Date;
    IsDeleted:           string;
}

export class Payment{    
        AccountHolderName: String
        AccountNumber: String;
        Adjudication: String;
        Amount: String;
        AuthenticationNumber: String;
        BankAccountNo: String;
        BankCode: String;
        CardNumber:String; 
        CardType: String;
        CreatedBy:String; 
        CreatedDate: Date;
        LastUpdatedDate: Date;
        LastupdatedBy: String;
        ModeOfPayment: String;
        PaymentGUID: any;
        TerminalId: String;
        TranDate: String;
        TranType: Date;
        Payment: String;
}

export class Notes{
    CaseID: String;
    CreatedBy: String;
    CreatedDate: String;
    Notes: String;
    NotesGuid: any;
    NotesType: String;
}

export class Hold{
    CaseId: String;
    CaseGuid: String;
    HoldGuid: string;
    HoldReasonType: String;
    Notes: String;
    CreatedBy: String;
    CreatedDate: String;
}
export class Unclaimed{
    CaseGUID: String;
    UnclaimedDeviceGUID: string;
    CompanyCode: string;
    UnclaimedDeviceReason: String;
    UnclaimedDeviceReasonDesc: String;
    // Notes: String;
    CreatedBy: String;
    CreatedDate: String;
}
export class Rfp{
    RFPCode : String;
    RFPDate : Date ;
    RFPStatus: String;
    Remark: String;
}

export class HandOver{
    HandOverCode : String;
    HandOverDate : Date ;
    HandOverStatus: String;
    Remark: String;
}

export interface DIAGATTACHMENT {
    ATTACHMENT: any[];
}

export class PartList{
    RepairDetailGUID:String;
    itemtype:String
    number:String;
    currency: String;
    partdescription: String;
    imageurl: String;
    stockprice: Number;
    exchangeprice: Number;
    substitutepartnumber: Number;
    pricingoption:String;
    type: String;
    price:Number;
    typedescription: String;
    taxpercentage:Number;
    taxamount:Number;
    netamount:Number;
    billable:boolean;
    coverageoptioncode:String;
    coverageoptiondescription:String;
    returnstatuscode:String;
    returnstatusdescription:String;
    componentcode:String;
    componentdescription;
    issuecode:String;
    issuedescription:String;
    reproducibilitycode:String;
    reproducubilitydescription:String;
    kgb:String;
    kbb:String;
    serialized:boolean;
    marginpercentage:Number;
    laborcode:String;
    consignmentstockused:boolean;    
    isdeleted:boolean;
    quantity:Number;

}

export class Quote{
    QuoteGuid:String;
    QuoteCode:String;
    CaseGuid:String;
    QuoteDate:Date;
    BaseAmount:number;
    Discount:number
    TaxAmount:number;
    NetAmount:number;
    Remark:String;
    Currency:String;
    QuoteStatus:String;
    QuoteDetail: QuoteItem[];
}

export class QuoteItem{
    InvoiceDetailGuid:String;
    ImageUrl:String;
    ItemType:String;
    Type:String;
    ItemNo:number;
    ItemCode:String;
    ItemDescription:String;
    Warranty:String;
    WarrantyDescription:String;
    Coverage:String
    CoverageDescription:String
    ComponentCode:String;
    ComponentDescription:String;
    IssueCode:String;
    IssueDescription:String;
    ExchangePrice:number;
    StockPrice:number;
    Margin:number
    GSTGroupCode:String;
    SAC_HSNCode:String;
    Quantity:number;
    PriceType:String;
    UnitPrice:number;
    BaseAmount:number;
    DiscountPercentage:number;
    HeaderDiscountAmount:number;
    DiscountAmount:number;
    TaxableAmount:number;
    TaxPercentage:number;
    TaxAmount:number;
    NetAmount:number;
    Currency:String;
    GSTJuridiction:String;
    PricingOptions:any[];
    GSTPercentage:number;
    GSTComponentDetails:any;
    isDeleted:boolean;
    rowno:number;
}

   
export class Invoice{
    InvoiceGuid:String;
    InvoiceCode:String;
    CaseGuid:String;
    InvoiceDate:Date;
    BaseAmount:number;
    Discount:number
    TaxAmount:number;
    NetAmount:number;
    Remark:String;
    Currency:String;
    InvoiceStatus:String;
    InvoiceDetail: InvoiceItem[];
}
    export class InvoiceItem{
        InvoiceDetailGuid:String;
        ImageUrl:String;
        ItemType:String;
        Type:String;
        ItemNo:number;
        ItemCode:String;
        ItemDescription:String;
        Warranty:String;
        WarrantyDescription:String;
        Coverage:String
        CoverageDescription:String
        ComponentCode:String;
        ComponentDescription:String;
        IssueCode:String;
        IssueDescription:String;
        ExchangePrice:number;
        StockPrice:number;
        Margin:number
        GSTGroupCode:String;
        SAC_HSNCode:String;
        Quantity:number;
        PriceType:String;
        UnitPrice:number;
        BaseAmount:number;
        DiscountPercentage:number;
        HeaderDiscountAmount:number;
        DiscountAmount:number;
        TaxableAmount:number;
        TaxPercentage:number;
        TaxAmount:number;
        NetAmount:number;
        Currency:String;
        GSTJuridiction:String;
        PricingOptions:any[];
        GSTPercentage:number;
        GSTComponentDetails:any;
        isDeleted:boolean;
        rowno:number;
    }

        

export  interface Repair  {
    RepairGuid:String;
    RepairCode:String;
    CaseGuid:String;
    RepairDate:Date;
    BaseAmount:number;
    Discount:number
    TaxAmount:number;
    NetAmount:number;
    Remark:String;
    Currency:String;
    RepairStatus:String;
    RepairQuestions:String;
    isGSXPosted: any;
    
}




export interface RepairItem{
    RepairDetailGuid:String;
    ImageUrl:String;
    ItemType:String;
    Type:String;
    ItemNo:number;
    ItemCode:String;
    ItemDescription:String;
    Warranty:String;
    WarrantyDescription:String;
    Coverage:String
    CoverageDescription:String
    ComponentCode:String;
    ComponentDescription:String;
    IssueCode:String;
    IssueDescription:String;
    ExchangePrice:number;
    StockPrice:number;
    Margin:number
    GSTGroupCode:String;
    SAC_HSNCode:String;
    Quantity:number;
    PriceType:String;
    UnitPrice:number;
    BaseAmount:number;
    DiscountPercentage:number;
    HeaderDiscountAmount:number;
    DiscountAmount:number;
    TaxableAmount:number;
    TaxPercentage:number;
    TaxAmount:number;
    NetAmount:number;
    Currency:String;
    GSTJuridictionType:String;
}

export interface type{
      type:string;
}