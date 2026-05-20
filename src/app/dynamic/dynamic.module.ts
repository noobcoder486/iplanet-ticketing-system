import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/material.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NitcControlModule } from '../nitc-control/nitc-control.module';
import { DynamicScriptLoaderService } from '../core/service/dynamic-script-loader.service';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [],

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    Ng2SmartTableModule,
    NgxDatatableModule,
    NitcControlModule,
    NgSelectModule
  ],
  exports: [],

  providers: [
    DynamicScriptLoaderService
  ]
})
export class DynamicModule { }
