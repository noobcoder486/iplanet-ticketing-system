import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Controller } from 'src/app/config/comman.const';
import { ApiService } from 'src/app/core/service/api.service';
import { Columns } from 'src/app/models/column.metadata';

@Injectable({
  providedIn: 'root'
})
export class GsxService {
  

  constructor(private apiService: ApiService) { }
  getDeviceDetails = (data) => {
    return this.apiService.postData(Controller.GSX + 'GetDeviceDetails', data);
  }

  getRepairEligibilityWOJob = (data)=> {
    return this.apiService.postData(Controller.GSX + 'GetWOJobRepairEligibility', data)
  }

  getPartsSummary = (data) => {
    return this.apiService.postData(Controller.GSX + 'GetPartsSummary', data);
  }

  getComponentIssue = (data) => {
    return this.apiService.postData(Controller.GSX + 'GetComponentIssue', data);
  }
  getRepairQuestions=(data) => {
    return this.apiService.postData(Controller.GSX + 'RepairQuestions', data);
  }
  
  getRepairSummary = (fetchAllRepair,data) =>
  {
    return this.apiService.postData(Controller.GSX + 'RepairSummary',data)
  }

  CreateUpdateRepair=(data) => {
    return this.apiService.postData(Controller.GSX + 'CreateUpdateRepair', data);
  }

  SaveForLaterRepair=(data) => {
    return this.apiService.postData(Controller.GSX + 'RepairDraftSubmit', data);
  }

  CreateNRepair=(data) => {
    return this.apiService.postData(Controller.GSX + 'CreateNRepair', data);
  }
  
  RepairEligibility=(data) => {
    return this.apiService.postData(Controller.GSX + 'RepairEligibility', data);
  }
  UpdateRepairNotesAndAttachments=(data) => {
    return this.apiService.postData(Controller.GSX + 'UpdateRepairNotesAndAttachments', data);
  }
  
  UpdateRepairNotesAndAttachmentsForIPlanet=(data) => {
    return this.apiService.postData(Controller.GSX + 'UpdateRepairNotesAndAttachmentsForIPlanet', data);
  }
  AcceptRejectRepair=(data) => {
    return this.apiService.postData(Controller.GSX + 'AcceptRejectRepair', data);
  }

  getStockingPartsSummary = (data) => {
    return this.apiService.postData(Controller.GSX + 'OrderStockingPartsSummary', data);
  }

  getRepairDetails=(LocationCode,CompanyCode,data) => {
     
    return this.apiService.postData(Controller.GSX + 'RepairDetails?LocationCode='+LocationCode+'&CompanyCode=' + CompanyCode, data);
  }

  generateEInvoiceForCRN = (data) =>{
    return this.apiService.postData(Controller.EInvoice + 'saveEinvoiceForCRN',data)
  }

  getReturnsLookup = (data) => {
    return this.apiService.postData(Controller.GSX + 'ReturnsLookup', data);
  }

  getOrderStockingSummary = (data) => {
    return this.apiService.postData(Controller.GSX + 'OrderStockingSummary', data);
  }

  saveOrderStockingCreate = (data) => {
    return this.apiService.postData(Controller.GSX + 'OrderStockingCreate ', data);
  }

  updateOrderStockingUpdate = (data) => {
    return this.apiService.postData(Controller.GSX + 'OrderStockingUpdate ', data);
  }

  deleteOrderStockingDalete = (data) => {
    return this.apiService.postData(Controller.GSX + 'OrderStockingDelete ', data);
  }

 getStockingPartsDetails = (data) => {
  return this.apiService.postData(Controller.GSX + 'OrderStockingDetails', data);
}

getInvoiceLink = (data) => {
  return this.apiService.postData(Controller.GSX + 'DocumentDownloadWithUrl', data);
}


getConsignmentDeliveryLookup = (data) => {
  return this.apiService.postData(Controller.GSX  + 'ConsignmentDeliveryLookup', data)
}

returnConfirmShipment = (data) => {
  return this.apiService.postData(Controller.GSX  + 'ReturnsConfirmShipment', data)
}
downloadDocument = (documentType,data) => {
  var url= Controller.GSX + "DocumentDownloadPost?documentType=" + documentType.toString()
  return this.apiService.postData(url, data);
}

ReturnsManage = (data) => {
  return this.apiService.postData(Controller.GSX + 'ReturnsManage', data);
  }

getConsignmentOrderLookup = (data) => {
  return this.apiService.postData(Controller.GSX + 'ConsignmentOrderLookup', data);
}

gsxSearch = (data) => {
  return this.apiService.postData(Controller.GSX + 'Search', data);
}


getConsignmentLookup = (data) => {
  return this.apiService.postData(Controller.GSX + 'ConsignmentLookup', data);
}
saveConsignmentAcknowldge= (data) => {
  return this.apiService.postData(Controller.GSX + 'ConsignmentDeliveryAcknowledge', data);
}
fetchUserDetail = () => {
  return this.apiService.getData(Controller.GSX + 'fetchGsxTokenDetails')
}
saveGsxTokenDetail = (data) =>{
  return this.apiService.postData(Controller.GSX + 'saveGsxActivationToken', data)
}

fetchDiagnosisSuit = (data) =>{
  return this.apiService.postData(Controller.GSX + 'DiagnosticsSuites', data)
}

fetchDiagnosisStatus = (data) =>{
  return this.apiService.postData(Controller.GSX + 'DiagnosticsStatus', data)
}

fetchDiagnosisLookup = (data) =>{
  return this.apiService.postData(Controller.GSX + 'DiagnosticsLookup', data)
}

InitiateDiagnostics = (data) =>{
  return this.apiService.postData(Controller.GSX + 'DiagnosticsInitiateTest', data)
}

getInvoiceStock = (plantcode,storagelocation) =>{
  return this.apiService.getData(Controller.SAP + 'getAllStockData?plantcode='+plantcode + "&storagelocation="+storagelocation)
}
getAllLocationData = (materialcode ) =>{
  return this.apiService.getData(Controller.SAP + 'getAllLocationData?materialcode='+materialcode )
}

saveSAPBillingDocument=(data)=>{
  return this.apiService.postData(Controller.SAP + 'saveSAPBillingDocument', data)
}

getSAPSerialNoData = (materialcode,serialno) =>{
  return this.apiService.getData(Controller.SAP + 'getSerialData?materialcode='+materialcode + '&serialno='+serialno)
}

getCostPrice = (materialcode,plantcode,batch) =>{
  return this.apiService.getData(Controller.SAP + 'getCostPrice?materialcode='+materialcode + '&plantcode='+plantcode + '&batch=' + batch)
}
saveCashDeposit = (CashDepositGUID) =>{
  return this.apiService.getData(Controller.SAP + 'saveCashDeposit?CashDepositGUID='+CashDepositGUID )
}
saveSalesReturnToSAP = (SalesReturnGUID) =>{
  return this.apiService.getData(Controller.SAP + 'saveSalesReturnToSAP?SalesReturnGUID='+SalesReturnGUID )
}

generateEInvoice = (data) =>{
  return this.apiService.postData(Controller.EInvoice + 'saveEinvoice',data)
}
generateEwayBill = (data) =>{
  return this.apiService.postData(Controller.EInvoice + 'saveEwayBill',data)
}
generateDCEwayBill = (data) =>{
  return this.apiService.postData(Controller.EInvoice + 'saveEwayBillDC',data)
}


uploadEDCTransaction = (data) => {
  return this.apiService.postData(Controller.PaymentGateway + 'UploadEDCTransaction',data)
}

getEDCTransactionStatus = (data) => {
  return this.apiService.postData(Controller.PaymentGateway + 'GetEDCTxnStatus',data)
}
saveSapAdvancePayment = (PaymentGUID) =>{
  return this.apiService.getData(Controller.SAP + 'saveSapAdvancePayment?PaymentGUID='+PaymentGUID )
}

SaveIncomingInvoiceSummary = (data) =>{
  return this.apiService.postData(Controller.IncomingInvoice + 'SaveIncomingInvoiceSummary',  data)
}
GetIncomingInvoiceDetail = (data) =>{
  return this.apiService.postData(Controller.GSX + 'InvoiceDetails',  data)
}

GetInvoiceSummary = (data) =>{
  return this.apiService.postData(Controller.IncomingInvoice + 'GetInvoiceSummary',  data)
}
uploadPaytmEDCTransaction = (data) => {
  return this.apiService.postData(Controller.PaymentGateway + 'UploadPaytmEDCTransaction',data)
}
getEDCPaytmTransactionStatus = (data) => {
  return this.apiService.postData(Controller.PaymentGateway + 'GetPaytmEDCTxnStatus',data)
}

getConsignmentStatus = (ShipTo,data) => {
  return this.apiService.postData(Controller.GSX + 'ConsignmentValidate?ShipTo='+ShipTo,data)
}

}
