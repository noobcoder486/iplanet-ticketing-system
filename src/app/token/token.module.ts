import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateTokenComponent } from './create-token/create-token.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { NgSelectModule } from '@ng-select/ng-select';
import { GaugeModule } from 'angular-gauge';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgxEchartsModule } from 'ngx-echarts';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DashboardRoutingModule } from '../dashboard/dashboard-routing.module';
import { NitcControlModule } from '../nitc-control/nitc-control.module';
import { ChartsModule as chartjsModule } from 'ng2-charts';
import { MaterialModule } from '../shared/material.module';
import { TokenGenerationComponent } from './token-generation/token-generation.component';
import { TokenDisplayComponent } from './token-display/token-display.component';
import { TokenCasaComponent } from './token-casa/token-casa.component';
import { ReservationDashboardComponent } from './reservation/reservation-dashboard.component';
import { AddReservationComponent } from './reservation/add-reservation/add-reservation.component';
import { ReservationGridComponent } from './reservation/reservation-grid/reservation-grid.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { MatRadioModule } from '@angular/material/radio';
import { MatBadgeModule } from '@angular/material/badge';
import { SptonSharedModule } from '../shared/spton-shared.module';
import { MatChipsModule } from '@angular/material/chips';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { MatStepperModule } from '@angular/material/stepper';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatCardModule } from '@angular/material/card';





@NgModule({
  declarations: [
    CreateTokenComponent,
    TokenGenerationComponent,
    TokenDisplayComponent,
    TokenCasaComponent,
    ReservationDashboardComponent,
    AddReservationComponent,
    ReservationGridComponent
  
  ],
  
  imports: [
    
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DashboardRoutingModule,
    chartjsModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    PerfectScrollbarModule,
    NgApexchartsModule,
    NgSelectModule,
    NgxSpinnerModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    GaugeModule.forRoot(),
    NitcControlModule,
    MaterialModule,
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
    
  ]
})
export class TokenModule { }
