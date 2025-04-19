import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ReportsService } from '../reports.service';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-ticket-trends',
  standalone: false,
  templateUrl: './ticket-trends.component.html',
  styleUrl: './ticket-trends.component.scss'
})
export class TicketTrendsComponent implements OnInit, OnChanges {
  @Input() dateRange: any;
  
  isLoading = false;
  error: string | null = null;
  
  // Chart data
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Created',
        fill: true,
        tension: 0.5,
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)'
      },
      {
        data: [],
        label: 'Resolved',
        fill: true,
        tension: 0.5,
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.2)'
      }
    ]
  };
  
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Tickets'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
    plugins: {
      legend: { display: true },
      tooltip: { mode: 'index', intersect: false }
    }
  };
  
  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loadTicketTrends();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dateRange'] && !changes['dateRange'].firstChange) {
      this.loadTicketTrends();
    }
  }
  
  loadTicketTrends(): void {
    this.isLoading = true;
    this.error = null;
    
    const startDate = this.dateRange?.startDate || new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = this.dateRange?.endDate || new Date();
    
    this.reportsService.getTicketTrends(startDate, endDate).subscribe({
      next: (data) => {
        this.updateChartData(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load ticket trends data.';
        this.isLoading = false;
        console.error('Error loading ticket trends:', err);
        // Add mock data for preview
        this.loadMockData();
      }
    });
  }
  
  private updateChartData(data: any): void {
    this.lineChartData.labels = data.labels;
    this.lineChartData.datasets[0].data = data.created;
    this.lineChartData.datasets[1].data = data.resolved;
    
    // Force chart update
    this.lineChartData = {...this.lineChartData};
  }
  
  // Mock data for preview
  private loadMockData(): void {
    const mockData = {
      labels: ['Apr 1', 'Apr 5', 'Apr 10', 'Apr 15', 'Apr 20', 'Apr 25', 'Apr 30', 'May 5', 'May 10', 'May 15'],
      created: [5, 12, 8, 15, 23, 17, 10, 19, 14, 8],
      resolved: [3, 8, 10, 12, 18, 20, 14, 9, 16, 11]
    };
    
    this.updateChartData(mockData);
  }
}
