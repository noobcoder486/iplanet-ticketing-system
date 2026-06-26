import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketingSystemComponent } from './ticketing-system/ticketing-system.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/material.module';
import { AddTicketComponent } from './ticketing-system/add-ticket/add-ticket.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ViewCustomerComponent } from './ticketing-system/view-customer/view-customer.component';
import { MapLocationComponent } from './ticketing-system/map-location/map-location.component';
import { AddProductComponent } from './ticketing-system/add-product/add-product.component';
import { MatCardModule } from '@angular/material/card';
import { CustomerExistsAlertComponent } from './ticketing-system/customer-exists-alert/customer-exists-alert.component';
import { ConfirmCustomerMappingComponent } from './ticketing-system/confirm-customer-mapping/confirm-customer-mapping.component';
import { MatIconModule } from '@angular/material/icon';
import { TicketingBulkQuotationComponent } from './ticketing-system/ticketing-bulk-quotation/ticketing-bulk-quotation.component';
import { AddQuotePartsComponent } from './ticketing-system/ticketing-bulk-quotation/add-quote-parts/add-quote-parts.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TicketDashboardComponent } from './ticketing-system/ticket-dashboard/ticket-dashboard.component';



@NgModule({
  declarations: [
    TicketingSystemComponent,
    AddTicketComponent,
    ViewCustomerComponent,
    MapLocationComponent,
    AddProductComponent,
    CustomerExistsAlertComponent,
    ConfirmCustomerMappingComponent,
    TicketingBulkQuotationComponent,
    AddQuotePartsComponent,
    TicketDashboardComponent
  ],
  imports: [
    CommonModule,
    NgSelectModule,
    MatPaginatorModule,
    MaterialModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    MatCardModule,
    MatIconModule,
    FormsModule,
  ],
  exports: [TicketingSystemComponent]

})
export class TicketingSystemModule { }
