export class IncomingInvoiceHeader {
    InvoiceGUID: string;
    invoiceId: string;
    invoiceDateTime: string;
    requestType: string;
    invoiceTypeDescription: string;
    invoiceTypeCode: string;
    currency: Date;
    CreatedBy: string;
    price: Price;
    parts: Parts[];
    account: Account;
    isSerialNoExists : boolean;
}
export class Price {
    totalAmount:            string;
    tax:            string;
    subTotalAmount:          string;
}

export class Parts {
    InvoiceDetailGuid : string;
    number:    string;
    netPrice:         string;
    description:        string;
    purchaseOrderNumber:           string;
    serviceOrderNumber:            string;
    repairId:             string;
    device:            Device;
    productName:            string;
   
}

export class Device{
    identifiers: Identifiers;
}

export class Identifiers{
    SerialNoGuid: string;
    serial:           string;
    imei:            string;
    meid:             string;
}

export class Account{
    shipTo:             string;
}






// export class InvoiceDetails {
//     CustAccGroupCode:    string;
//     CompanyCode:         string;
//     CustomerCode:        string;
//     FirstName:           string;
//     LastName:            string;
//     Blocked:             string;
//     Address1:            string;
//     Address2:            string;
//     CountryCode:         string;
//     StateCode:           string;
//     City:                string;
//     ZipCode:             string;
//     MobileNo:            string;
//     PhoneNo:             string;
//     EmailID:             string;
//     TaxType:             string;
//     GSTRegistrationNo:   string;
//     GSTRegistrationType: string;
//     DefaultPartnerCode:  string;
//     BillToCustomerCode:  string;
//     PriceGroup:          string;
//     CreatedBy:           string;
//     CreatedDate:         Date;
//     LastUpdatedBy:       string;
//     LastUpdatedDate:     Date;
//     CountryName:         string;
//     StateName:           string;
// }

// export class InvoiceSerialNoDetails {
//     number:            string;
//     netPrice:            string;
//     DiagnosisGUID:          string;
//     CaseGUID:               string;
//     DiagnosisCode:          string;
//     DiagnosisDate:          Date;
//     DiagnosisStatus:        string;
//     SubmissionType:         string;
//     SubmissionTypeDesc:     string;
//     ServiceNRepairType:     string;
//     SubmissionDateTime:     Date;
//     NoOfDaysToComplete:     Number;
//     NoOfDaysToCompleteDesc: String;
//     RepairType:             string;
//     RepairTypeDesc:         string;
//     BillingOption:          string;
//     BillingOptionDescription:      string;
//     PaymentTerms:           string;
//     PartsCovered:           boolean;
//     LaborCovered:           boolean;
//     BillableRepair:         number;
//     Remark:                 string;
//     CustomerCompanyName:    string;
//     GSXCode:                string;
//     CreatedBy:              string;
//     LastUpdatedBy:          string;
//     CreatedDate:            Date;
//     LastUpdatedDate:        Date;
//     IsDeleted:              boolean;
//     DIAGLIST:               Diaglist;
//     DIAGATTACHMENT: DIAGATTACHMENT;
// }