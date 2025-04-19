import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ReportsService } from '../reports.service';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-status-distribution',
  standalone: false,
  templateUrl: './status-distribution.component.html',
  styleUrl: './status-distribution.component.scss'
})
export class StatusDistributionComponent implements OnInit, OnChanges {
  @Input() dateRange: any;
  
  isLoading = false;
  error: string | null = null;
  
  // Chart data
  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Open', 'In Progress', 'Resolved', 'Closed', 'Reopened'],
    datasets: [{
      data: [],
      backgroundColor: [
        '#f44336', // Red for Open
        '#ff9800', // Orange for In Progress
        '#4caf50', // Green for Resolved
        '#2196f3', // Blue for Closed
        '#9c27b0'  // Purple for Reopened
      ]
    }]
  };
  
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.formattedValue;
            const dataset = context.dataset;
            const total = dataset.data.reduce((acc: number, data: number) => acc + data, 0);
            const percentage = Math.round((context.parsed / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  
  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loadStatusDistribution();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dateRange'] && !changes['dateRange'].firstChange) {
      this.loadStatusDistribution();
    }
  }
  
  loadStatusDistribution(): void {
    this.isLoading = true;
    this.error = null;
    
    this.reportsService.getStatusDistribution().subscribe({
      next: (data) => {
        this.updateChartData(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load status distribution data.';
        this.isLoading = false;
        console.error('Error loading status distribution:', err);
        // Add mock data for preview
        this.loadMockData();
      }
    });
  }
  
  private updateChartData(data: any): void {
    // Update chart data
    if (data && data.counts) {
      this.pieChartData.datasets[0].data = [
        data.counts.OPEN || 0,
        data.counts.IN_PROGRESS || 0,
        data.counts.RESOLVED || 0,
        data.counts.CLOSED || 0,
        data.counts.REOPENED || 0
      ];
      
      // Force chart update
      this.pieChartData = {...this.pieChartData};
    }
  }
  
  // Mock data for preview
  private loadMockData(): void {
    const mockData = {
      counts: {
        OPEN: 32,
        IN_PROGRESS: 48,
        RESOLVED: 65,
        CLOSED: 120,
        REOPENED: 15
      }
    };
    
    this.updateChartData(mockData);
  }
}
