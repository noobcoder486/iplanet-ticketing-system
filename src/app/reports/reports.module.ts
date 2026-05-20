import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../shared/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NitcControlModule } from '../nitc-control/nitc-control.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatCardModule } from '@angular/material/card';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { TokenReportComponent } from './token-report/token-report.component';
import { JobReportComponent } from './job-report/job-report.component';
import { SalesReportComponent } from './sales-report/sales-report.component';
import { PaymentReportComponent } from './payment-report/payment-report.component';
import { CommunicationDetailsReportComponent } from './communication-details-report/communication-details-report.component';
import { AdvancePaymentReportComponent } from './advance-payment-report/advance-payment-report.component';
import { CashDepositReportComponent } from './cash-deposit-report/cash-deposit-report.component';
import { BulkReturnReportComponent } from './bulk-return-report/bulk-return-report.component';
import { CustomerJourneyReportComponent } from './customer-journey-report/customer-journey-report.component';
import { DailySummaryReportComponent } from './daily-summary-report/daily-summary-report.component';
import { StockReportComponent } from './stock-report/stock-report.component';
import { PinelabReportComponent } from './pinelab-report/pinelab-report.component';
import { CashRegisterReportComponent } from './cash-register-report/cash-register-report.component';
import { CancellationReportComponent } from './cancellation-report/cancellation-report.component';
import { IncomingInvoiceReportComponent } from './incoming-invoice-report/incoming-invoice-report.component';
import { OpenJobReportComponent } from './open-job-report/open-job-report.component';
import { CustomerLedgerReportComponent } from './customer-ledger-report/customer-ledger-report.component';
import { LeadManagementReportComponent } from './lead-management-report/lead-management-report.component';
import { DeliveryChallanReportComponent } from './delivery-challan-report/delivery-challan-report.component';
import { ReservationReportComponent } from './reservation-report/reservation-report.component';
import { PartialAdvanceReportComponent } from './partial-advance-report/partial-advance-report.component';
import { RefundReportComponent } from './refund-report/refund-report.component';
import { ReferralDetailsReportComponent } from './referral-details-report/referral-details-report.component';
import { CheckInCheckOutReportComponent } from './check-in-check-out-report/check-in-check-out-report.component';
import { UnclaimedDeviceReportComponent } from './unclaimed-device-report/unclaimed-device-report.component';
import { ToteReportComponent } from './tote-report/tote-report.component';
import { ConsignmentLockdateLogsComponent } from './consignment-lockdate-logs/consignment-lockdate-logs.component';
import { ResetQuotationDetailsComponent } from './reset-quotation-details/reset-quotation-details.component';
import { InterCompanyAmountTransferReportComponent } from './inter-company-amount-transfer-report/inter-company-amount-transfer-report.component';
import { InboundCallManagementReportComponent } from './inbound-call-management-report/inbound-call-management-report.component';
import { QuotationReportComponent } from './quotation-report/quotation-report.component';
import { EnquiryListReportComponent } from './enquiry-list-report/enquiry-list-report.component';

@NgModule({
  declarations: [
  
    TokenReportComponent,
       JobReportComponent,
       SalesReportComponent,
       PaymentReportComponent,
       CommunicationDetailsReportComponent,
       AdvancePaymentReportComponent,
       CashDepositReportComponent,
       BulkReturnReportComponent,
       CustomerJourneyReportComponent,
       DailySummaryReportComponent,
       StockReportComponent,
       PinelabReportComponent,
       CashRegisterReportComponent,
       CancellationReportComponent,
       IncomingInvoiceReportComponent,
       OpenJobReportComponent,
       CustomerLedgerReportComponent,
       LeadManagementReportComponent,
       DeliveryChallanReportComponent,
       ReservationReportComponent,
       PartialAdvanceReportComponent,
       RefundReportComponent,
       ReferralDetailsReportComponent,
       CheckInCheckOutReportComponent,
       UnclaimedDeviceReportComponent,
       ToteReportComponent,
       ConsignmentLockdateLogsComponent,
       ResetQuotationDetailsComponent,
       InterCompanyAmountTransferReportComponent,
       InboundCallManagementReportComponent,
       QuotationReportComponent,
       EnquiryListReportComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    NitcControlModule,
    NgSelectModule,
    MatCardModule,
    NgxSpinnerModule,
    MatDatepickerModule,
    MatInputModule,
    NgxSpinnerModule

  ]
})
export class ReportsModule { }