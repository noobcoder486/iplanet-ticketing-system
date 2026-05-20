import { Injectable } from '@angular/core';
import { DropDownType, RequestValue } from 'src/app/custom-components/call-login/metadata/request.metadata';
import { DynamicService } from '../dynamicService/dynamic.service';
import { HttpClient, HttpRequest, HttpEvent } from '@angular/common/http';
import { BehaviorSubject, Observable } from "rxjs";
import xml2js from 'xml2js';

@Injectable({
  providedIn: 'root'
})
export class DropdownDataService {
  private baseurl = "";
  constructor(private dynamicService: DynamicService,
    private http: HttpClient) { }
  upload(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData
    formData.append('file', file);
    const req = new HttpRequest('POST', `${this.baseurl}/upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });
    return this.http.request(req);

  }
  getFiles(): Observable<any> {
    return this.http.get(`${this.baseurl}/files`);
  }
  getPatnerTypeValue(type: DropDownType): String {
    let strType = "";
    switch (type) {
      case DropDownType.CustAccountGroup:
        strType = "RtlCustomer";
        break;
      case DropDownType.LocationAccountGroupCode:
        strType = "Location";
        break;
    }
    return strType;
  }
  GetComboTypeValue(type: DropDownType): String {
    let strType = "";
    switch (type) {
      case DropDownType.ItemReceivable:
        strType = "BindItemReceivable";
        break;
      case DropDownType.NoOfDays:
        strType = "MasterContent";
        break;
      case DropDownType.Symptoms:
        strType = "MasterContent";
        break;
      case DropDownType.ELSStatus:
        strType = "MasterContent";
        break;
      case DropDownType.TransportationCarrier:
        strType = "MasterContent";
        break;  
      case DropDownType.Customer:
        strType = "BindRTLCustomer";
        break;
      case DropDownType.Country:
        strType = "BindCountry";
        break;
      case DropDownType.State:
        strType = "BindState"
        break;
      case DropDownType.WarrantyStatus:
        strType = "MasterContent";
        break;
      case DropDownType.repair:
        strType = "MasterContent";
        break;
      case DropDownType.defect:
        strType = "MasterContent";
        break;
      case DropDownType.CustAccountGroup:
        strType = "BindPartnerAccGroup";
        break;
      case DropDownType.GSTRegistration:
        strType = "MasterContent";
        break;
      case DropDownType.callForm:
        strType = "BindJobType";
        break;
      case DropDownType.materialCode:
        strType = "BindFGMaterial";
        break;
      case DropDownType.Location:
        strType = "BindLocation4Job";
        break;
      case DropDownType.ToLocation:
        strType = "BindToLocation";
        break;
      case DropDownType.LocationDropoff:
        strType = "BindLocationDropoff";
        break;
        
      case DropDownType.Technician:
        strType = "BindTechnician";
        break;
      case DropDownType.ServiceType:
        strType = "MasterContent";
        break;
      case DropDownType.BomMaterial:
        strType = "BindBomMaterial";
        break;
      case DropDownType.RepairType:
        strType = "MasterContent";
        break;
      case DropDownType.CovarageOption:
        strType = "MasterContent"
        break;
      case DropDownType.Reproducibility:
        strType = "MasterContent"
        break;
      case DropDownType.ProductType:
        strType = "MasterContent";
        break;
      case DropDownType.BillingOption:
        strType = "MasterContent";
        break;
      case DropDownType.DiagStatus:
        strType = "MasterContent";
        break;
      case DropDownType.PartType:
        strType = "MasterContent";
        break;
      case DropDownType.ItemType:
        strType = "MasterContent";
        break;
      case DropDownType.ResourceType:
        strType = "MasterContent";
        break;
      case DropDownType.TaxType:
        strType = "MasterContent";
        break;
      case DropDownType.LocationPriceGroup:
        strType = "MasterContent";
        break;
      case DropDownType.MatPriceGroup:
        strType = "MasterContent"
        break;
      case DropDownType.ProductCategory:
        strType = "MasterContent"
        break;
      case DropDownType.RepairStatus:
        strType = "MasterContent"
        break;
      case DropDownType.ProductCategory:
        strType = "MasterContent"
        break;
      case DropDownType.LocationAccountGroupCode:
        strType = "BindPartnerAccGroup"
        break;
      case DropDownType.MaterialItemCode:
        strType = "BindMaterial"
        break;
      case DropDownType.ResourceItemCode:
        strType = "BindResource"
        break;
      case DropDownType.PaymentTerm:
      strType = "BindPaymentTerm"
      break;
      case DropDownType.GSTGroupCode:
        strType = "BindGSTGroup"
        break;
      case DropDownType.GSTComponentCode:
        strType = "BindGSTComponent"
        break;
      case DropDownType.GSTJuridictionType:
        strType = "MasterContent"
        break;
      case DropDownType.VisitPurpose:
        strType = "MasterContent"
        break;
      case DropDownType.JobStatus:
        strType = "MasterContent"
        break;
      case DropDownType.JobRole:
        strType = "BindJobRole"
        break;
      case DropDownType.OrgRole:
        strType = "BindOrgRole"
        break;
      case DropDownType.TicketStatus:
        strType = "MasterContent"
        break;
      case DropDownType.TimeZone:
        strType = "BindTimeZone"
        break;
      case DropDownType.Language:
        strType = "BindLanguage"
        break;
      case DropDownType.Company:
        strType = "BindCompany"
        break;
      case DropDownType.SubmissionType:
        strType = "MasterContent"
        break;
      case DropDownType.ProductName:
        strType = "BindProductName"
        break;  
      case DropDownType.QuoteStatus:
        strType = "MasterContent"
        break; 
        case DropDownType.MenuGroup:
        strType = "BindMenuGroup"
        break;
        case DropDownType.DocumentType:
        strType = "BindDocumentType"
        break;
      case DropDownType.StoDocType:
        strType = "BindSTODocumentType"
        break;
      case DropDownType.InvoiceDocType:
        strType = "MasterContent"
        break;
      case DropDownType.ModeofPayment:
        strType = "BindModeofPayment"
        break;
      case DropDownType.SalesPerson:
        strType="BindSalesPerson"
        break;
      case DropDownType.BindProfileId:
        strType = "BindProfileId";
        break;
        case DropDownType.BindModuleId:
          strType = "BindModuleId";
          break;
      case DropDownType.RefundDocType:
        strType = "MasterContent"
        break;
      case DropDownType.RefundReason:
        strType = "MasterContent"
        break;
      case DropDownType.RefundStatus:
        strType = "MasterContent"
        break;
        
      case DropDownType.BindCompany4OrgRole:
      strType = "BindCompany4OrgRole"
      break;
      case DropDownType.RefundType:
        strType = "BindRefundRequest";
        break;  
      case DropDownType.PricingOption:
        strType = "BindPricingOption";
        break;
      case DropDownType.Bank:
        strType = "BindBank";
        break;  
      case DropDownType.Disposition:
        strType = "MasterContent";
        break
      case DropDownType.ServiceNonRepairType:
        strType = "MasterContent"
        break
      case DropDownType.AdvanceModeofPayment:
      strType = "BindAdvanceModeofPayment"
      break
      case DropDownType.RefundModeofPayment:
        strType = "BindRefundModeofPayment"
        break
      case DropDownType.EnqDisposition:
        strType = "MasterContent";
        break;
      case DropDownType.Location4All:
        strType = "BindLocation4All"
        break;
      // Bulk Return
      case DropDownType.Vendor4Bulk:
        strType = "BindVendor4Bulk";
        break; 
      case DropDownType.BulkReturnType:
        strType = "MasterContent";
        break; 
      case DropDownType.BulkReturnStatus:
        strType = "MasterContent";
        break;  
      case DropDownType.ModeOfTransport:
        strType = "MasterContent";
        break;  
      case DropDownType.VehicleType:
        strType = "MasterContent";
        break;  
      case DropDownType.BindCompany4Username:
      strType = "BindCompany4Username";
      break;  
      case DropDownType.DeclineRepair:
        strType = "MasterContent";
        break; 
      case DropDownType.HoldRepair:
        strType = "MasterContent";
        break; 
      case DropDownType.ReferredBy:
        strType = "MasterContent";
        break; 
      case DropDownType.AllowedPaymentMode:
        strType = "MasterContent";
        break; 
      case DropDownType.UnclaimDeviceReason:
        strType = "MasterContent";
        break;
      case DropDownType.IncomingInvoiceStatus:
        strType = "MasterContent";
        break;
      case DropDownType.DeliveryChallanPartStatus:
        strType = "MasterContent";
        break;
      case DropDownType.DeliveryChallanStatus:
        strType = "MasterContent";
        break;
      case DropDownType.GSXRepairStatus:
        strType = "MasterContent";
        break;
      case DropDownType.DCTransportationCarrier:
        strType = "MasterContent";
        break;
      case DropDownType.PriceGroup:
        strType = "MasterContent";
        break;
      case DropDownType.MaterialPriceGroup:
        strType = "MasterContent";
        break;           
      case DropDownType.DropoffStatus:
        strType = "MasterContent";
        break; 
      case DropDownType.ReservationStatus:
        strType = "MasterContent";
        break;  
      case DropDownType.LeadDisposition:
        strType = "MasterContent";
        break; 
      case DropDownType.HappyCallingDisposition:
        strType = "MasterContent";
        break;  
      case DropDownType.RegistryType:
        strType = "MasterContent";
        break; 
      case DropDownType.RegistryFrom:
        strType = "MasterContent";
        break; 
      case DropDownType.ApplePartsType:
        strType = "MasterContent";
        break;   
      case DropDownType.RefundDocCode:
        strType = "BindRefundDocCode";
        break;      
      case DropDownType.PartnerList:
        strType = "MasterContent";
        break;  
      case DropDownType.BindApprover:
        strType = "BindApprover";
        break; 
        case DropDownType.UnclaimedDocType:
        strType = "MasterContent";
        break;  
        case DropDownType.BULKRTNORDERDCSTATUS:
        strType = "MasterContent";
        break;  
        case DropDownType.BOXTYPE:
        strType = "MasterContent";
        break;  
        case DropDownType.CUSTVISITSRC:
        strType = "MasterContent";
        break;
        case DropDownType.SecondRepairReason:
        strType = "MasterContent";
        break;
        case DropDownType.CustomerSourceName:
        strType = "CustomerSourceName";
        break;
        case DropDownType.AdvancePaymentCode:
        strType = "AdvancePaymentCode";
        break;
        case DropDownType.BindSchemeMaster:
        strType = "BindSchemeMaster";
        break;
        case DropDownType.CallDisposition:
        strType = "MasterContent";
        break;
        case DropDownType.CONVERTTOLEAD:
        strType = "MasterContent";
        break;
        case DropDownType.LeadParentDetails:
        strType = "MasterContent";
        break;
        case DropDownType.BindAmcTypeMaster:
        strType = "BindAmcTypeMaster";
        break;
        case DropDownType.BindAmcContractDetails:
        strType = "BindAmcContractDetails";
        break;
         case DropDownType.BindCompanyStock:
        strType = "BindCompanyStock";
        break;
          case DropDownType.MATGROUP1:
        strType = "MasterContent";
        break;
         case DropDownType.MATGROUP2:
        strType = "MasterContent";
        break;
         case DropDownType.MATGROUP3:
        strType = "MasterContent";
        break;
         case DropDownType.MATGROUP4:
        strType = "MasterContent";
        break;
         case DropDownType.BRAND:
        strType = "MasterContent";
        break;
         case DropDownType.MATCATEGORY:
        strType = "MasterContent";
        break;
         case DropDownType.MATPRICESOURCE:
        strType = "MasterContent";
        break;
         case DropDownType.DISCOUNTTYPE:
        strType = "MasterContent";
        break;
         case DropDownType.QUOTERESETREASON:
        strType = "QUOTERESETREASON";
        break;
         case DropDownType.QUOTEREJECTREASON:
        strType = "MasterContent";
        break;
         case DropDownType.TRADEIN:
        strType = "TRADEIN";
        break;
         case DropDownType.TRADEINCATEGORY:
        strType = "MasterContent";
        break;
         case DropDownType.Disposition4Communication:
        strType = "Disposition4Communication";
        break;
         case DropDownType.RFUSTATUS:
        strType = "MasterContent";
        break;
          case DropDownType.DataBackup:
        strType = "MasterContent";
        break;
        case DropDownType.TRADEINPARTNER:
        strType = "MasterContent";
        break;
         case DropDownType.InsuranceType:
        strType = "MasterContent";
        break;
    }
    return strType;
  }
  GetEntityIdValue(type: DropDownType): String {
    let strType = "";
    switch (type) {

      case DropDownType.ItemReceivable:
        strType = "";
        break;
      case DropDownType.Symptoms:
        strType = "SYMPTOM";
        break;
      case DropDownType.ELSStatus:
        strType = "ELSSTATUS";
        break;
      case DropDownType.defect:
        strType = "DEFECT";
        break;
      case DropDownType.repair:
        strType = "REPAIR";
        break;
      case DropDownType.GSTRegistration:
        strType = "GSTREGTYPE"
        break;
      case DropDownType.WarrantyStatus:
        strType = "WARRANTYSTATUS"
        break;
      case DropDownType.ServiceType:
        strType = "SERVICETYPE"
        break;
      case DropDownType.RepairType:
        strType = "REPAIRTYPE"
        break;
      case DropDownType.CovarageOption:
        strType = "COVERAGEOPTION"
        break;
      case DropDownType.Reproducibility:
        strType = "REPRODUCIBILITY"
        break;
      case DropDownType.ProductType:
        strType = "PRODUCTTYPE";
        break;
      case DropDownType.BillingOption:
        strType = "BILLINGOPTION";
        break;
      case DropDownType.DiagStatus:
        strType = "DIAGSTATUS";
        break;
      case DropDownType.NoOfDays:
        strType = "DIAGNOOFDAY";
        break;
      case DropDownType.PartType:
        strType = "PARTTYPE";
        break;
      case DropDownType.ItemType:
        strType = "ITEMTYPE";
        break;
      case DropDownType.ResourceType:
        strType = "RESOURCETYPE";
        break;
      case DropDownType.TaxType:
        strType = "TAXTYPE";
        break;
      case DropDownType.LocationPriceGroup:
        strType = "LOCATIONPRICEGROUP";
        break;
      case DropDownType.MatPriceGroup:
        strType = "MATPRICEGROUP";
        break;
      case DropDownType.MatPriceGroup:
        strType = "PRODUCTCATEGORY";
        break;
      case DropDownType.RepairStatus:
        strType = "ALLREPAIRSTATUSCODES";
        break;
      case DropDownType.VisitPurpose:
        strType = "VISITPURPOSE"
        break;
      case DropDownType.GSTJuridictionType:
        strType = "GSTJuridictionType"
        break;
      case DropDownType.PaymentTerm:
        strType = "PAYMENTTERM"
        break;
      case DropDownType.JobStatus:
        strType = "JOBSTATUS"
        break;
      case DropDownType.ProductCategory:
        strType = "PRODUCTCATEGORY"
        break;
      case DropDownType.SubmissionType:
        strType = "SUBMISSIONTYPE"
        break;
      case DropDownType.TransportationCarrier:
        strType = "TRANSPORTCARRIER"
        break;
      case DropDownType.QuoteStatus:
        strType = "QUOTESTATUS"
        break;
      case DropDownType.InvoiceDocType:
        strType = "INVOICEDOCTYPE"
        break;
      case DropDownType.RefundDocType:
        strType = "REFDOCTYPE" // REFUNDDOCTYPE is too long a word for the MasterCode in Master Content List Table
        break;
      case DropDownType.RefundReason:
        strType = "REFREASON"
        break;
      case DropDownType.RefundStatus:
        strType = "REFUNDSTATUS"
        break;
        
      case DropDownType.Disposition:
        strType = "DISPOSITION";
        break;
      case DropDownType.ServiceNonRepairType:
        strType = "SERVICENREPAIRTYPE"
        break;
      case DropDownType.EnqDisposition:
        strType = "ENQDISPOSITION";
        break;
      
      // Bulk Return
      case DropDownType.BulkReturnType:
        strType = "BULKRETURNTYPE";
        break; 
      case DropDownType.BulkReturnStatus:
        strType = "BULKRETURNSTATUS";
        break;  
      case DropDownType.ModeOfTransport:
        strType = "MODEOFTRANSPORT";
        break;  
      case DropDownType.VehicleType:
        strType = "VEHICLETYPE";
        break; 
      case DropDownType.TicketStatus:
        strType = "TICKETSTATUS";
        break;  
      case DropDownType.DeclineRepair:
        strType = "DECLINEREPAIR";
        break; 
      case DropDownType.HoldRepair:
        strType = "HOLDREPAIR";
        break;
      case DropDownType.ReferredBy:
        strType = "REFERREDBY";
        break;  
      case DropDownType.AllowedPaymentMode:
        strType = "ALLOWEDPAYMENTMODE";
        break;
      case DropDownType.UnclaimDeviceReason:
        strType = "UNCLAIMDEVICEREASON";
        break;
      case DropDownType.IncomingInvoiceStatus:
        strType = "INCINVSTATUS";
        break;
      case DropDownType.DeliveryChallanPartStatus:
        strType = "RECEIVEDSTATUS";
        break;
      case DropDownType.DeliveryChallanStatus:
        strType = "DLVCHALLANSTATUS";
        break; 
      case DropDownType.GSXRepairStatus:
        strType = "GSXREPAIRSTATUS";
        break;
      case DropDownType.DCTransportationCarrier:
        strType = "DCTPCARRIER";
        break;
      case DropDownType.PriceGroup:
        strType = "PRICEGROUP";
        break;
      case DropDownType.MaterialPriceGroup:
        strType = "MATERIALPRICEGROUP";
        break;
      case DropDownType.DropoffStatus:
        strType = "DROPOFFSTATUS";
        break;  
      case DropDownType.ReservationStatus:
        strType = "RESVSTATUS";
        break;      
      case DropDownType.LeadDisposition:
        strType = "LEADDISPOSITION";
        break;  
      case DropDownType.HappyCallingDisposition:
        strType = "HAPPYCALLINGDISPO";
        break;  
      case DropDownType.RegistryType:
        strType = "REGISTRYTYPE";
        break; 
      case DropDownType.RegistryFrom:
        strType = "REGISTRYFROM";
        break; 
      case DropDownType.ApplePartsType:
        strType = "APPLEPARTSTYPE";
        break;   
      case DropDownType.PartnerList:
        strType = "PARTNERLIST";
        break;  
         case DropDownType.UnclaimedDocType:
        strType = "UNCLAIMEDDOCTYPE";
        break;  
         case DropDownType.BULKRTNORDERDCSTATUS:
        strType = "BULKRTNORDERDCSTATUS";
        break;  
         case DropDownType.BOXTYPE:
        strType = "BOXTYPE";
        break;  
         case DropDownType.CUSTVISITSRC:
        strType = "CUSTVISITSRC";
        break;  
         case DropDownType.SecondRepairReason:
        strType = "SecondRepairReason";
        break;  
         case DropDownType.CallDisposition:
        strType = "CallDisposition";
        break;  
        case DropDownType.CONVERTTOLEAD:
        strType = "CONVERTTOLEAD";
        break;  
        case DropDownType.LeadParentDetails:
        strType = "LeadParentDetails";
        break;  

          case DropDownType.MATGROUP1:
        strType = "MATGROUP1";

        break; case DropDownType.MATGROUP2:
        strType = "MATGROUP2";

        break; case DropDownType.MATGROUP3:
        strType = "MATGROUP3";

        break; case DropDownType.MATGROUP4:
        strType = "MATGROUP4";

        break; case DropDownType.BRAND:
        strType = "BRAND";

        break; case DropDownType.MATCATEGORY:
        strType = "MATCATEGORY";
        break; 
        break; case DropDownType.MATPRICESOURCE:
        strType = "MATPRICESOURCE";
        break; 
         break;
          case DropDownType.DISCOUNTTYPE:
        strType = "DISCOUNTTYPE";
        break; 
          
        
          case DropDownType.QUOTEREJECTREASON:
        strType = "QUOTEREJECTREASON";
        break; 
       
          case DropDownType.TRADEINCATEGORY:
        strType = "TRADEINCATEGORY";
        break; 
         case DropDownType.RFUSTATUS:
        strType = "RFUSTATUS";
        break; 
         case DropDownType.TRADEINPARTNER:
        strType = "TRADEINPARTNER";
        break; 
         case DropDownType.DataBackup:
        strType = "DataBackup";
        break; 
        case DropDownType.InsuranceType:
        strType = "InsuranceType";
        break; 
    }
    return strType;
  }


  public fetchDropDownData(type: DropDownType, SearchText: String, options?: {
    CountryCode?: string,
    ProductCategory?: string,
    OrgRoleId?: string,
    CompanyCode?: string,
    LocationCode?: string,
    MasterMaterialCode?: string,
    JobType?: string,
    CustomerCode?: string,
    DocType?: string,
    RefundReason?: string,
    BulkReturnType?: string,
    CustVisitSourceCode?:string
    SerialNo?:string,
    Parameter?:string,


  }): Observable<DropDownValue> {
    const mainRequest: RequestValue[] = [];
    mainRequest.push(new RequestValue("ComboType", this.GetComboTypeValue(type)));
    mainRequest.push(new RequestValue("EntityId", this.GetEntityIdValue(type)));
    mainRequest.push(new RequestValue("PartnerType", this.getPatnerTypeValue(type)));
    if (options?.CountryCode != null) {
      mainRequest.push(new RequestValue("CountryCode", options.CountryCode));
    }
    if (options?.CompanyCode != null) {
      mainRequest.push(new RequestValue("CompanyCode", options.CompanyCode));
    }
    if (options?.OrgRoleId != null) {
      mainRequest.push(new RequestValue("OrgRoleId", options.OrgRoleId));
    }
    if(options?.ProductCategory != null){
      mainRequest.push(new RequestValue("ProductCategory", options.ProductCategory))
    }
    if (options?.MasterMaterialCode != null) {
      mainRequest.push(new RequestValue("MasterMaterialCode", options.MasterMaterialCode));
    }
    mainRequest.push(new RequestValue("SearchTerm", SearchText));
    if (options?.JobType != null) {
      mainRequest.push(new RequestValue("JobType", options.JobType));
    }
    if (options?.LocationCode != null) {
      mainRequest.push(new RequestValue("LocationCode", options.LocationCode));
    }

    if (options?.CustomerCode != null) {
      mainRequest.push(new RequestValue("CustomerCode", options.CustomerCode));
    }
    if (options?.DocType != null) {
      mainRequest.push(new RequestValue("DocType", options.DocType));
    }
    if (options?.RefundReason != null) {  
      mainRequest.push(new RequestValue("RefundReason", options.RefundReason));
    }
    // Bulk Return
    if (options?.BulkReturnType != null) {  
      mainRequest.push(new RequestValue("BulkReturnType", options.BulkReturnType));
    }
    if (options?.CustVisitSourceCode != null) {  
      mainRequest.push(new RequestValue("CustVisitSourceCode", options.CustVisitSourceCode));
    }
    if (options?.SerialNo != null) {  
      mainRequest.push(new RequestValue("SerialNo", options.SerialNo));
    }
    if (options?.Parameter != null) {  
      mainRequest.push(new RequestValue("Parameter", options.Parameter));
    }
    console.log("DROPOFF " , options?.DocType )
    let subject = new BehaviorSubject<DropDownValue>(null);
    this.dynamicService.getDropdownExtraData({
      Content: JSON.stringify(mainRequest)
    }).subscribe({
      next: (value) => {
        try {
          let ddv = DropDownValue.parse(value);
          subject.next(ddv);
        } catch (e) {
          subject.error(e);
        }
      },
      error: err => {
        subject.error(err);
      },
      complete: () => {
        subject.complete();
      }
    });
    return subject.asObservable();
  }
}

export class DropDownValue {
  TotalRecord: number;
  Data: any[];
  extraData: any;

  static parse(json): DropDownValue {
    let ddv = new DropDownValue();
    let jsonValue = JSON.parse(json);
    ddv.TotalRecord = jsonValue['TotalRecord'];
    ddv.Data = JSON.parse(jsonValue['Data']);
    for (let d of ddv.Data) {
      let parser = new xml2js.Parser(
        {
          trim: true,
          explicitArray: true
        });
      parser.parseString(d['extraData'], function (err, result) {
        d['extraDataJson'] = result;
      });
    }
    return ddv;
  }

  static getBlankObject(): DropDownValue {
    const ddv = new DropDownValue();
    ddv.TotalRecord = 0;
    ddv.Data = [];
    return ddv;
  }

}
