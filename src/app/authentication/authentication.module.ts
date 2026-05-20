import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthenticationRoutingModule } from './authentication-routing.module';
import { Page500Component } from './page500/page500.component';
import { Page404Component } from './page404/page404.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { LockedComponent } from './locked/locked.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CustomerInvoiceComponent } from './customer-invoice/customer-invoice.component';
import { MatCardModule} from '@angular/material/card';
import { DiscountApproverComponent } from './discount-approver/discount-approver.component';
import { TokenDisplayComponent } from './token-display/token-display.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { QuoteApproverComponent } from './quote-approver/quote-approver.component';

@NgModule({
  declarations: [
    Page500Component,
    Page404Component,
    SigninComponent,
    SignupComponent,
    LockedComponent,
    ForgotPasswordComponent,
    CustomerInvoiceComponent,
    DiscountApproverComponent,
    TokenDisplayComponent,
    ResetPasswordComponent,
    QuoteApproverComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AuthenticationRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ]
})
export class AuthenticationModule {}
