import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ReportsService } from '../reports.service';

export interface UserActivityData {
  username: string;
  fullName: string;
  ticketsCreated: number;
  ticketsResolved: number;
  commentsAdded: number;
  lastActive: Date;
}

@Component({
  selector: 'app-user-activity',
  standalone: false,
  templateUrl: './user-activity.component.html',
  styleUrl: './user-activity.component.scss'
})
export class UserActivityComponent implements OnInit, OnChanges {
  @Input() dateRange: any;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  isLoading = false;
  error: string | null = null;
  
  displayedColumns: string[] = ['username', 'fullName', 'ticketsCreated', 'ticketsResolved', 'commentsAdded', 'lastActive'];
  dataSource = new MatTableDataSource<UserActivityData>();
  
  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loadUserActivity();
  }
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dateRange'] && !changes['dateRange'].firstChange) {
      this.loadUserActivity();
    }
  }
  
  loadUserActivity(): void {
    this.isLoading = true;
    this.error = null;
    
    const days = 30; // Default to 30 days
    
    this.reportsService.getUserActivity(days).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load user activity data.';
        this.isLoading = false;
        console.error('Error loading user activity:', err);
        // Add mock data for preview
        this.loadMockData();
      }
    });
  }
  
  // Apply filter for the table
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  // Mock data for preview
  private loadMockData(): void {
    const mockData: UserActivityData[] = [
      {
        username: 'johndoe',
        fullName: 'John Doe',
        ticketsCreated: 15,
        ticketsResolved: 24,
        commentsAdded: 48,
        lastActive: new Date(2025, 3, 18)
      },
      {
        username: 'janesmith',
        fullName: 'Jane Smith',
        ticketsCreated: 8,
        ticketsResolved: 19,
        commentsAdded: 36,
        lastActive: new Date(2025, 3, 19)
      },
      {
        username: 'mikejohnson',
        fullName: 'Mike Johnson',
        ticketsCreated: 12,
        ticketsResolved: 15,
        commentsAdded: 27,
        lastActive: new Date(2025, 3, 17)
      },
      {
        username: 'sarahparker',
        fullName: 'Sarah Parker',
        ticketsCreated: 3,
        ticketsResolved: 0,
        commentsAdded: 12,
        lastActive: new Date(2025, 3, 16)
      },
      {
        username: 'robertwilson',
        fullName: 'Robert Wilson',
        ticketsCreated: 7,
        ticketsResolved: 10,
        commentsAdded: 25,
        lastActive: new Date(2025, 3, 15)
      }
    ];
    
    this.dataSource.data = mockData;
  }
}
