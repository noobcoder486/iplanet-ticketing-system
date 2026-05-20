import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockedComponent } from './locked/locked.component';
import { Page404Component } from './page404/page404.component';
import { Page500Component } from './page500/page500.component';
import { CustomerInvoiceComponent } from './customer-invoice/customer-invoice.component';
import { DiscountApproverComponent } from './discount-approver/discount-approver.component';
import { TokenDisplayComponent } from './token-display/token-display.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { QuoteApproverComponent } from './quote-approver/quote-approver.component';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full'
  },
  {
    path: 'signin',
    component: SigninComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'locked',
    component: LockedComponent
  },
  {
    path: 'page404',
    component: Page404Component
  },
  {
    path: 'page500',
    component: Page500Component
  },
  {
    path: 'customer-invoice',
    component: CustomerInvoiceComponent
  },
  {
    path: 'approver',
    component: DiscountApproverComponent
  },
  {
    path: 'quote-approver',
    component: QuoteApproverComponent
  },
  {
    path: 'token-display',
    component: TokenDisplayComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule {}
