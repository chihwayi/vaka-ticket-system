import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReportsService } from '../reports.service';

@Component({
  selector: 'app-main-reports',
  standalone: false,
  templateUrl: './main-reports.component.html',
  styleUrl: './main-reports.component.scss'
})
export class MainReportsComponent {
  filterForm: FormGroup;
    isLoading = false;
    
    // Date range defaults
    today = new Date();
    thirtyDaysAgo = new Date(this.today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    constructor(
      private fb: FormBuilder,
      private reportsService: ReportsService
    ) {
      // Initialize filter form
      this.filterForm = this.fb.group({
        startDate: [this.thirtyDaysAgo],
        endDate: [this.today],
        supportAgent: ['all']
      });
    }
  
    ngOnInit(): void {}
  
    applyFilters(): void {
      // This will be handled by individual child components
      // Each component will react to form changes as needed
    }
  
    exportReports(format: string): void {
      this.isLoading = true;
      // In a real application, you would call a service to export data
      setTimeout(() => {
        this.isLoading = false;
        alert(`Reports exported as ${format} successfully!`);
      }, 1500);
    }
  
    printReports(): void {
      window.print();
    }

}
