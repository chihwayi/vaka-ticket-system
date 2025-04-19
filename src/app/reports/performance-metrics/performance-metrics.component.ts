import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ReportsService } from '../reports.service';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-performance-metrics',
  standalone: false,
  templateUrl: './performance-metrics.component.html',
  styleUrl: './performance-metrics.component.scss'
})
export class PerformanceMetricsComponent implements OnInit, OnChanges {
  @Input() dateRange: any;
  @Input() supportAgent: string = 'all';
  
  isLoading = false;
  error: string | null = null;
  
  // Chart data
  public radarChartData: ChartConfiguration<'radar'>['data'] = {
    labels: [
      'Resolution Speed', 
      'First Response Time', 
      'Tickets Resolved', 
      'Customer Satisfaction', 
      'Communication Quality',
      'Ticket Quality'
    ],
    datasets: [
      {
        data: [],
        label: 'Agent Performance',
        backgroundColor: 'rgba(103, 58, 183, 0.2)',
        borderColor: '#673ab7',
        pointBackgroundColor: '#673ab7'
      },
      {
        data: [],
        label: 'Team Average',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderColor: '#4caf50',
        pointBackgroundColor: '#4caf50'
      }
    ]
  };
  
  public radarChartOptions: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20
        }
      }
    }
  };
  
  performanceStats = {
    ticketsAssigned: 0,
    ticketsResolved: 0,
    averageResolutionTime: '0',
    customerSatisfaction: '0',
    responseRate: '0'
  };
  
  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loadPerformanceMetrics();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['dateRange'] && !changes['dateRange'].firstChange) || 
        (changes['supportAgent'] && !changes['supportAgent'].firstChange)) {
      this.loadPerformanceMetrics();
    }
  }
  
  loadPerformanceMetrics(): void {
    this.isLoading = true;
    this.error = null;
    
    const userId = this.supportAgent !== 'all' ? parseInt(this.supportAgent) : undefined;
    
    this.reportsService.getPerformanceMetrics(userId).subscribe({
      next: (data) => {
        this.updateChartData(data);
        this.updatePerformanceStats(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load performance metrics data.';
        this.isLoading = false;
        console.error('Error loading performance metrics:', err);
        // Add mock data for preview
        this.loadMockData();
      }
    });
  }
  
  private updateChartData(data: any): void {
    if (data && data.metrics && data.teamAverage) {
      this.radarChartData.datasets[0].data = [
        data.metrics.resolutionSpeed || 0,
        data.metrics.firstResponseTime || 0,
        data.metrics.ticketsResolved || 0,
        data.metrics.customerSatisfaction || 0,
        data.metrics.communicationQuality || 0,
        data.metrics.ticketQuality || 0
      ];
      
      this.radarChartData.datasets[1].data = [
        data.teamAverage.resolutionSpeed || 0,
        data.teamAverage.firstResponseTime || 0,
        data.teamAverage.ticketsResolved || 0,
        data.teamAverage.customerSatisfaction || 0,
        data.teamAverage.communicationQuality || 0,
        data.teamAverage.ticketQuality || 0
      ];
      
      // Label adjustment based on agent selection
      this.radarChartData.datasets[0].label = this.supportAgent !== 'all' ? 
        data.agentName || 'Selected Agent' : 'Team Performance';
      
      // Force chart update
      this.radarChartData = {...this.radarChartData};
    }
  }
  
  private updatePerformanceStats(data: any): void {
    if (data && data.stats) {
      this.performanceStats = {
        ticketsAssigned: data.stats.ticketsAssigned || 0,
        ticketsResolved: data.stats.ticketsResolved || 0,
        averageResolutionTime: data.stats.averageResolutionTime || '0',
        customerSatisfaction: data.stats.customerSatisfaction || '0',
        responseRate: data.stats.responseRate || '0'
      };
    }
  }
  
  // Mock data for preview
  private loadMockData(): void {
    const mockData = {
      agentName: 'John Doe',
      metrics: {
        resolutionSpeed: 85,
        firstResponseTime: 78,
        ticketsResolved: 92,
        customerSatisfaction: 88,
        communicationQuality: 90,
        ticketQuality: 82
      },
      teamAverage: {
        resolutionSpeed: 70,
        firstResponseTime: 65,
        ticketsResolved: 75,
        customerSatisfaction: 80,
        communicationQuality: 75,
        ticketQuality: 78
      },
      stats: {
        ticketsAssigned: 48,
        ticketsResolved: 42,
        averageResolutionTime: '1 day, 4 hours',
        customerSatisfaction: '4.4/5',
        responseRate: '94%'
      }
    };
    
    this.updateChartData(mockData);
    this.updatePerformanceStats(mockData);
  }
}
