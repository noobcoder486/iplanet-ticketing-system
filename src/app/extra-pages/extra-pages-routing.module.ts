import { Routes, RouterModule } from '@angular/router';
import { BlankComponent } from './blank/blank.component';
import { NgModule } from '@angular/core';
const routes: Routes = [
  {
    path: 'blank',
    component: BlankComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExtraPagesRoutingModule { }
