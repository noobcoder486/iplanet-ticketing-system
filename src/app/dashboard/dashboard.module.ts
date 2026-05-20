import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { MainComponent } from './main/main.component';
import { ChartsModule as chartjsModule } from 'ng2-charts';
import { NgxEchartsModule } from 'ngx-echarts';
import { GaugeModule } from 'angular-gauge';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MaterialModule } from '../shared/material.module';
import { MatButtonModule } from '@angular/material/button';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CompanyDetailComponent } from './company-detail/company-detail.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NitcControlModule } from '../nitc-control/nitc-control.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { NgSelectModule } from '@ng-select/ng-select';
import { ChangePasswordComponent } from './change-password/change-password.component';

@NgModule({
  declarations:
    [
      MainComponent,
      CompanyDetailComponent,
      ChangePasswordComponent
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
    MaterialModule,
    NgSelectModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    GaugeModule.forRoot(),
    NitcControlModule
  ],
  entryComponents: [
    CompanyDetailComponent
  ]
})
export class DashboardModule { }
