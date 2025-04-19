import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ReportsService } from '../reports.service';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-priority-analysis',
  standalone: false,
  templateUrl: './priority-analysis.component.html',
  styleUrl: './priority-analysis.component.scss'
})
export class PriorityAnalysisComponent implements OnInit, OnChanges {
  @Input() dateRange: any;
  
  isLoading = false;
  error: string | null = null;
  
  // Chart data
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        data: [],
        label: 'New',
        backgroundColor: 'rgba(33, 150, 243, 0.7)',
      },
      {
        data: [],
        label: 'Resolved',
        backgroundColor: 'rgba(76, 175, 80, 0.7)',
      }
    ]
  };
  
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Horizontal bar chart
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Tickets'
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
    this.loadPriorityAnalysis();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dateRange'] && !changes['dateRange'].firstChange) {
      this.loadPriorityAnalysis();
    }
  }
  
  loadPriorityAnalysis(): void {
    this.isLoading = true;
    this.error = null;
    
    this.reportsService.getPriorityAnalysis().subscribe({
      next: (data) => {
        this.updateChartData(data);
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load priority analysis data.';
        this.isLoading = false;
        console.error('Error loading priority analysis:', err);
        // Add mock data for preview
        this.loadMockData();
      }
    });
  }
  
  private updateChartData(data: any): void {
    if (data && data.new && data.resolved) {
      this.barChartData.datasets[0].data = [
        data.new.CRITICAL || 0,
        data.new.HIGH || 0,
        data.new.MEDIUM || 0,
        data.new.LOW || 0
      ];
      
      this.barChartData.datasets[1].data = [
        data.resolved.CRITICAL || 0,
        data.resolved.HIGH || 0,
        data.resolved.MEDIUM || 0,
        data.resolved.LOW || 0
      ];
      
      // Force chart update
      this.barChartData = {...this.barChartData};
    }
  }
  
  // Mock data for preview
  private loadMockData(): void {
    const mockData = {
      new: {
        CRITICAL: 8,
        HIGH: 24,
        MEDIUM: 53,
        LOW: 30
      },
      resolved: {
        CRITICAL: 7,
        HIGH: 21,
        MEDIUM: 46,
        LOW: 37
      }
    };
    
    this.updateChartData(mockData);
  }
}
