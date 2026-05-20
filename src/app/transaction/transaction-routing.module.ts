import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RepairProcessComponent } from './repair-process/repair-process.component';

const routes: Routes = [
  {
    path: 'repair-process',
    component: RepairProcessComponent

  },
 

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})


export class TransactionRoutingModule { }
