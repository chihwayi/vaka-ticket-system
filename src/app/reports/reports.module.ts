import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { BaseChartDirective } from 'ng2-charts';

import { ReportsRoutingModule } from './reports-routing.module';
import { MainReportsComponent } from './main-reports/main-reports.component';
import { TicketTrendsComponent } from './ticket-trends/ticket-trends.component';
import { StatusDistributionComponent } from './status-distribution/status-distribution.component';
import { PriorityAnalysisComponent } from './priority-analysis/priority-analysis.component';
import { UserActivityComponent } from './user-activity/user-activity.component';
import { PerformanceMetricsComponent } from './performance-metrics/performance-metrics.component';
import { ResponseTimeComponent } from './response-time/response-time.component';


@NgModule({
  declarations: [
    MainReportsComponent,
    TicketTrendsComponent,
    StatusDistributionComponent,
    PriorityAnalysisComponent,
    UserActivityComponent,
    PerformanceMetricsComponent,
    ResponseTimeComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FormsModule, 
    ReactiveFormsModule,
    CommonModule,
    MatMenuModule,
    BaseChartDirective 
  ]
})
export class ReportsModule { }
