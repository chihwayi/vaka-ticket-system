import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainReportsComponent } from './main-reports/main-reports.component';

const routes: Routes = [
  { path: '', component: MainReportsComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
