import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route, Routes } from '@angular/router';
import { DiagnosisViewComponent } from './repair-process/diagnosis/diagnosis-view/diagnosis-view.component';
import { DiagnosisComponent } from './repair-process/diagnosis/diagnosis.component';
import { HandOverComponent } from './repair-process/hand-over/hand-over.component';
import { NotesComponent } from './repair-process/notes/notes.component';
import { PaymentComponent } from './repair-process/payment/payment.component';
import { QuoteViewComponent } from './repair-process/quote-view/quote-view.component';
import { ReadyToPickupComponent } from './repair-process/ready-to-pickup/ready-to-pickup.component';
import { RepairProcessComponent } from './repair-process/repair-process.component';
import { RepairViewComponent } from './repair-process/repair-view/repair-view.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { BrowserModule } from '@angular/platform-browser';
import { NgSelectModule } from '@ng-select/ng-select';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NitcControlModule } from '../nitc-control/nitc-control.module';
import { MaterialModule } from '../shared/material.module';
import { SptonSharedModule } from '../shared/spton-shared.module';
import { SwiperModule } from 'swiper/angular';
import { DiagnosisPopupComponent } from './repair-process/pop-up/diagnosis-popup/diagnosis-popup.component';
import { QuotePopupComponent } from './repair-process/pop-up/quote-popup/quote-popup.component';
import { RepairPopComponent } from './repair-process/pop-up/repair-pop/repair-pop.component';
import { FeedbackComponent } from './repair-process/feedback/feedback.component';
import { QuestionComponent } from './repair-process/feedback/question/question.component';
import { ImageUploadComponent } from './repair-process/image-upload/image-upload.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { AssignTechComponent } from './repair-process/pop-up/assign-tech/assign-tech.component';
import {MatExpansionModule} from '@angular/material/expansion';
import { InvoiceComponent } from './repair-process/invoice/invoice.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SignatureComponent } from './repair-process/pop-up/signature/signature.component';
import { RejectNoteComponent } from './repair-process/pop-up/reject-note/reject-note.component';
import { ReplaceLineBreaks } from 'src/app/common/Services/replacelinebreak/replace.linebreak';
import { DeadOnArrivalPopComponent } from './repair-process/pop-up/dead-on-arrival-pop/dead-on-arrival-pop.component';
import { GoodPartReturnPopComponent } from './repair-process/pop-up/good-part-return-pop/good-part-return-pop.component';
import { ConvertToStockPopComponent } from './repair-process/pop-up/convert-to-stock-pop/convert-to-stock-pop.component';
import { StockDOAPopComponent } from './repair-process/pop-up/stock-doa-pop/stock-doa-pop.component';
import { VerificationComponent } from './repair-process/verification/verification.component';
import { NotesListComponent } from './repair-process/pop-up/notes-list/notes-list.component';
import { OtpVerificationComponent } from './repair-process/pop-up/otp-verification/otp-verification.component';
import { DiagnosticComponent } from './repair-process/diagnostic/diagnostic.component';
import { MapGidComponent } from './repair-process/pop-up/map-gid/map-gid.component';
import { CommunicationDetailsComponent } from './repair-process/pop-up/communication-details/communication-details.component';
import { CommunicationHistoryComponent } from './repair-process/pop-up/communication-history/communication-history.component';
import { AllEventComponent } from './repair-process/all-event/all-event.component';
import { LoanerComponent } from './repair-process/loaner/loaner.component';
import { HoldNoteComponent } from './repair-process/pop-up/hold-note/hold-note.component';
import { RepairLogsComponent } from './repair-process/pop-up/repair-logs/repair-logs.component';
import { DiscountCouponComponent } from './repair-process/pop-up/discount-coupon/discount-coupon.component';
import { CallCustomerComponent } from './repair-process/pop-up/call-customer/call-customer.component';
import { OnsiteProcessComponent } from './onsite-process/onsite-process.component';
import { OnsiteProcessListComponent } from './onsite-process/onsite-process-list/onsite-process-list.component';
import { AssignToMeComponent } from './repair-process/pop-up/assign-to-me/assign-to-me.component';
import { SecondRepairPopupComponent } from './repair-process/pop-up/second-repair-popup/second-repair-popup.component';
import { QuotationResetsPopupComponent } from './repair-process/pop-up/quotation-resets-popup/quotation-resets-popup.component';
import { TableReplacementComponent } from './repair-process/table-replacement/table-replacement.component';
import { CompanyStockPopupComponent } from './repair-process/pop-up/company-stock-popup/company-stock-popup.component';
import { TableReplacementResetPopupComponent } from './repair-process/pop-up/table-replacement-reset-popup/table-replacement-reset-popup.component';
import { ResetQuotePopupComponent } from './repair-process/pop-up/reset-quote-popup/reset-quote-popup.component';
import { ResetDiagnosisPopupComponent } from './repair-process/pop-up/reset-diagnosis-popup/reset-diagnosis-popup.component';
import { DataBackupResetPopupComponent } from './repair-process/pop-up/data-backup-reset-popup/data-backup-reset-popup.component';

const routes: Routes = [

];

@NgModule({

  declarations: [
    RepairProcessComponent,
    DiagnosisComponent,
    NotesComponent,
    ReadyToPickupComponent,
    PaymentComponent,
    RepairViewComponent,
    QuoteViewComponent,
    DiagnosisViewComponent,
    HandOverComponent,
    DiagnosisPopupComponent,
    QuotePopupComponent,
    RepairPopComponent,
    FeedbackComponent,
    QuestionComponent,
    ImageUploadComponent,
    AssignTechComponent,
    InvoiceComponent,
    SignatureComponent,
    RejectNoteComponent,
    ReplaceLineBreaks,
    DeadOnArrivalPopComponent,
    GoodPartReturnPopComponent,
    ConvertToStockPopComponent,
    StockDOAPopComponent,
    VerificationComponent,
    NotesListComponent,
    OtpVerificationComponent,
    DiagnosticComponent,
    MapGidComponent,
    CommunicationDetailsComponent,
    CommunicationHistoryComponent,
    AllEventComponent,
    LoanerComponent,
    HoldNoteComponent,
    RepairLogsComponent,
    DiscountCouponComponent,
    CallCustomerComponent,
    OnsiteProcessComponent,
    OnsiteProcessListComponent,
    AssignToMeComponent,
    SecondRepairPopupComponent,
    QuotationResetsPopupComponent,
    TableReplacementComponent,
    CompanyStockPopupComponent,
    TableReplacementResetPopupComponent,
    ResetQuotePopupComponent,
    ResetDiagnosisPopupComponent,
    DataBackupResetPopupComponent,
  ],

  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    Ng2SmartTableModule,
    NitcControlModule,
    NgSelectModule,
    MatRadioModule,
    MatBadgeModule,
    SptonSharedModule,
    MatChipsModule,
    SwiperModule,
    MatStepperModule,
    BrowserModule,
    HttpClientModule,
    ScrollingModule,
    MatTooltipModule,
    MatExpansionModule,
    NgxSpinnerModule
    
  ],
  // exports: [
  //   TransactionModule,
  // ]

})
export class TransactionModule { }
