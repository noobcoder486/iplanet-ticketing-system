import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Controller } from 'src/app/config/comman.const';
// import { Controller } from '../config/global';
import { ApiService } from 'src/app/core/service/api.service';
// import { ApiService } from '../core/service/api.service';
import { Columns } from 'src/app/models/column.metadata';
// import { Columns } from '../models/column.metadata';


@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private apiService: ApiService) { }
  downloadServiceReport = (reportType,data) => {
     ;
    if(reportType=='SERVICE')
    {
      return this.apiService.postData(Controller.Report + 'DownloadServiceReport', data);
    }
    if(reportType=='SNR')
    {
      return this.apiService.postData(Controller.Report + 'DownloadSNRServiceReport', data);
    }
    else if(reportType=='DIAGNOSIS')
    {
      return this.apiService.postData(Controller.Report + 'DownloadDiagnosisReport', data);
    }
    else if(reportType=='DELIVERY')
    {
      return this.apiService.postData(Controller.Report + 'DownloadDeliveryReport', data);
    }
    else if(reportType=='PAYMENT')
    {
      return this.apiService.postData(Controller.Report + 'DownloadPaymentReport', data);
    }
    else if(reportType=='INVOICE')
    {
      return this.apiService.postData(Controller.Report + 'DownloadInvoiceReport', data);
    }
    else if(reportType=='QUOTE')
    {
      return this.apiService.postData(Controller.Report + 'DownloadQuoteReport', data);
    }
    else if(reportType=='TOKEN')
    {
      return this.apiService.postData(Controller.Report + 'ExportReport', data);
    }
    else if(reportType=='JOB')
    {
      return this.apiService.postData(Controller.Report + 'ExportJobReport', data);
    }
    else if(reportType=='SALES')
    {
      return this.apiService.postData(Controller.Report + 'ExportSalesReport', data);
    }
    else if(reportType=='EXPORTPAYMENT')
    {
      return this.apiService.postData(Controller.Report + 'ExportPaymentReport', data);
    }
    else if(reportType=='downloadBulkReturnDC')
    {
      return this.apiService.postData(Controller.Report + 'downloadBulkReturnDC', data);
    }
    else if(reportType=='downloadBulkReturnEwayBill')
    {
      return this.apiService.postData(Controller.Report + 'downloadBulkReturnEwayBill', data);
    }
    else if(reportType=='downloadDeliveryChallan')
    {
      return this.apiService.postData(Controller.Report + 'downloadDeliveryChallan', data);
    }
   else if(reportType=='SALESRETURN')
    {
      return this.apiService.postData(Controller.Report + 'downloadSalesReturnReport', data);
    }
    else if(reportType=='SALESRETURNINVOICE')
    {
      return this.apiService.postData(Controller.Report + 'downloadSalesReturnEInvoice', data);
    }
    else if(reportType=='COMMUNICATION')
    { 
      return this.apiService.postData(Controller.Report + 'ExportCommunicationReport', data);
    }
    else if(reportType=='ADVANCEPAYMENT')
    {
      return this.apiService.postData(Controller.Report + 'downloadAdvancePaymentReport', data);
    } 
    else if(reportType=='CASHDEPOSIT')
    {
      return this.apiService.postData(Controller.Report + 'downloadCashDepositReport', data);
    } 
    else if(reportType=='DAILYSUMMARY')
    {
      return this.apiService.postData(Controller.Report + 'downloadDailySummaryReport', data);
    } 
      else if(reportType=='downloadContractReport')
    {
      return this.apiService.postData(Controller.Report + 'downloadContractReport', data);
    } 
    else if(reportType=='UNIVERSAL')
    {
      return this.apiService.postData(Controller.Report + 'ExportAnyReport', data);
    } 
    
  }
}
