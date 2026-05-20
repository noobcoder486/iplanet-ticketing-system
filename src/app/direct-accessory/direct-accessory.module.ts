import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectSalesComponent } from './direct-sales/direct-sales.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/material.module';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NitcControlModule } from '../nitc-control/nitc-control.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatRadioModule } from '@angular/material/radio';
import { MatBadgeModule } from '@angular/material/badge';
import { SptonSharedModule } from '../shared/spton-shared.module';
import { MatChipsModule } from '@angular/material/chips';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { MatStepperModule } from '@angular/material/stepper';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RouterModule,Routes } from '@angular/router';
import { AddCustomerComponent } from './add-customer/add-customer.component';

const routes: Routes = [

];


@NgModule({
  declarations: [
    DirectSalesComponent,
    AddCustomerComponent
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
  ]
})
export class DirectAccessoryModule { }
