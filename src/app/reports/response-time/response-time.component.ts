import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ReportsService } from '../reports.service';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-response-time',
  standalone: false,
  templateUrl: './response-time.component.html',
  styleUrl: './response-time.component.scss'
})
export class ResponseTimeComponent implements OnInit, OnChanges {
  @Input() dateRange: any;
  
  isLoading = false;
  error: string | null = null;
  
  // Chart data
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'First Response Time',
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.2)',
        tension: 0.4,
        fill: true
      },
      {
        data: [],
        label: 'Resolution Time',
        borderColor: '#673ab7',
        backgroundColor: 'rgba(103, 58, 183, 0.2)',
        tension: 0.4,
        fill: true
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
          text: 'Time (Hours)'
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
  
  responseMetrics = {
    averageFirstResponse: '0',
    averageResolutionTime: '0',
    responseSLA: '0',
    resolutionSLA: '0'
  };
  
  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loadResponseTimeData();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dateRange'] && !changes['dateRange'].firstChange) {
      this.loadResponseTimeData();
    }
  }
  
  loadResponseTimeData(): void {
    this.isLoading = true;
    this.error = null;
    
    const startDate = this.dateRange?.startDate || new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = this.dateRange?.endDate || new Date();
    
    this.reportsService.getResponseTimeAnalysis(startDate, endDate).subscribe({
      next: (data) => {
        this.updateChartData(data);
        this.updateMetrics(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load response time analysis data.';
        this.isLoading = false;
        console.error('Error loading response time data:', err);
        // Add mock data for preview
        this.loadMockData();
      }
    });
  }
  
  private updateChartData(data: any): void {
    if (data && data.timeline) {
      this.lineChartData.labels = data.timeline.labels;
      this.lineChartData.datasets[0].data = data.timeline.firstResponseTime;
      this.lineChartData.datasets[1].data = data.timeline.resolutionTime;
      
      // Force chart update
      this.lineChartData = {...this.lineChartData};
    }
  }
  
  private updateMetrics(data: any): void {
    if (data && data.metrics) {
      this.responseMetrics = {
        averageFirstResponse: data.metrics.averageFirstResponse || '0',
        averageResolutionTime: data.metrics.averageResolutionTime || '0',
        responseSLA: data.metrics.responseSLA || '0',
        resolutionSLA: data.metrics.resolutionSLA || '0'
      };
    }
  }
  
  // Mock data for preview
  private loadMockData(): void {
    const mockData = {
      timeline: {
        labels: ['Apr 1', 'Apr 5', 'Apr 10', 'Apr 15', 'Apr 20', 'Apr 25', 'Apr 30', 'May 5', 'May 10', 'May 15'],
        firstResponseTime: [2.5, 1.8, 3.2, 2.1, 1.5, 2.8, 2.2, 1.9, 2.7, 2.3],
        resolutionTime: [12.5, 18.3, 15.7, 9.8, 14.2, 10.5, 8.3, 11.8, 13.5, 9.1]
      },
      metrics: {
        averageFirstResponse: '2.3 hours',
        averageResolutionTime: '12.6 hours',
        responseSLA: '92%',
        resolutionSLA: '87%'
      }
    };
    
    this.updateChartData(mockData);
    this.updateMetrics(mockData);
  }
}
