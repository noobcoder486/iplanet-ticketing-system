import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextComponent } from './text/text.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { NumberComponent } from './number/number.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/material.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { GridComponent } from './grid/grid.component';
import { GridFormComponent } from './grid-form/grid-form.component';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { FormChildGridComponent } from './form-child-grid/form-child-grid.component';
import { ComboMultiSelectComponent } from './combo-multi-select/combo-multi-select.component';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { PopUpComponent } from './pop-up/pop-up.component';
import { DebounceClickDirective } from '../config/debounce-click.directive';


@NgModule({
  declarations: [
    TextComponent,
    DropdownComponent,
    NumberComponent,
    CheckboxComponent,
    GridComponent,
    GridFormComponent,
    FormChildGridComponent,
    ComboMultiSelectComponent,
    DatePickerComponent,
    PopUpComponent,
    DebounceClickDirective,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgSelectModule,
    Ng2SmartTableModule,
  ],
  exports:[
    TextComponent,
    DropdownComponent,
    NumberComponent,
    CheckboxComponent,
    GridComponent,
    GridFormComponent,
    FormChildGridComponent,
    DatePickerComponent,
    DebounceClickDirective,

  ],
  entryComponents:[
    PopUpComponent
  ]
})
export class NitcControlModule { }
