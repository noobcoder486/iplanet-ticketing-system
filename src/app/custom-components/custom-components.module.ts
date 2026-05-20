import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileListComponent } from './profile-list/profile-list.component';
import { ProfileSettingComponent } from './profile-setting/profile-setting.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { AppRouter } from '../config/comman.const';
import { MaterialModule } from '../shared/material.module';
import { AuthGuard } from '../core/guard/auth.guard';
import { NitcControlModule } from '../nitc-control/nitc-control.module';
import { SubmenuComponent } from './submenu/submenu.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatRadioModule } from '@angular/material/radio';
import { MatBadgeModule } from '@angular/material/badge';
import { CallLoginDashboardComponent } from './call-login-dashboard/call-login-dashboard.component';
import { CreateTabsComponent } from '../spotn-shared/createtabs/createtabs.component';
import { SptonSharedModule } from '../shared/spton-shared.module';
import { CallLoginGridComponent } from './call-login-dashboard/call-login-grid/call-login-grid.component';
import { AssignTechnicianComponent } from './assign-technician/assign-technician.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CreateJobCustomerComponent } from './create-job-customer/create-job-customer.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CreateCustomerComponent } from './create-customer/create-customer.component';
import { AddCustomerComponent } from './create-customer/add-customer/add-customer.component';
import { MatCardModule } from '@angular/material/card';
import { SwiperConfigInterface, SwiperModule, SWIPER_CONFIG } from 'ngx-swiper-wrapper';
import { UserFormComponent } from './user-form/user-form.component';
import { JobCreateSignatureComponent } from './create-job-customer/job-create-signature/job-create-signature.component';
import { EnquiryFormComponent } from './create-customer/enquiry-form/enquiry-form.component';
import { SelectTokenComponent } from './create-customer/select-token/select-token.component';
import { AddProductComponent } from './create-job-customer/add-product/add-product.component';
import { OtpVerificationComponent } from './create-customer/otp-verification/otp-verification.component';
import { DiagnosticComponent } from './create-job-customer/diagnostic/diagnostic.component';
import { VerificationPopupComponent } from './create-job-customer/verification-popup/verification-popup.component';
import { ImagePopupComponent } from './create-job-customer/image-popup/image-popup.component';
import { RefundPopupComponent } from './refund-popup/refund-popup.component';
const routes: Routes = []
@NgModule({
    declarations: [
        ProfileListComponent,
        ProfileSettingComponent,
        SubmenuComponent,
        CallLoginDashboardComponent,
        CallLoginGridComponent,
        AssignTechnicianComponent,
        CreateJobCustomerComponent,
        CreateCustomerComponent,
        AddCustomerComponent,
        UserFormComponent,
        RefundPopupComponent,
        JobCreateSignatureComponent,
        EnquiryFormComponent,
        SelectTokenComponent,
        AddProductComponent,
        OtpVerificationComponent,
        DiagnosticComponent,
        VerificationPopupComponent,
        ImagePopupComponent,

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
        NgxSpinnerModule,
        MatDialogModule,
        MatCardModule
    ],
    providers: [
        DatePipe,
    ],
    exports: [
        RouterModule,
    ]
})
export class CustomComponentModule { }
