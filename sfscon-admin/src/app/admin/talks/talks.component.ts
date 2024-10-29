import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule, NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';
import { AdminService } from '../../../services/admin.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';

interface DataItem {
  title: string;
  bookmarks: string;
  speakers: string;
  rates: number;
  avg_rate: number;
}

interface BaseColumnItem {
  title: string;
  priority: boolean | number;
}

interface SortableColumnItem extends BaseColumnItem {
  sortable: true;
  sortDirections: NzTableSortOrder[];
  sortField: string;
}

interface NonSortableColumnItem extends BaseColumnItem {
  sortable: false;
}

type ColumnItem = SortableColumnItem | NonSortableColumnItem;

@Component({
  selector: 'app-talks',
  standalone: true,
  imports: [
    CommonModule,
    NzIconModule,
    NzButtonModule,
    NzAlertModule,
    NzInputModule,
    NzTableModule
  ],
  templateUrl: './talks.component.html',
  styleUrl: './talks.component.scss'
})
export class TalksComponent implements OnInit {
  adminService = inject(AdminService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  isExporting = false;
  loading = false;

  listOfColumn: ColumnItem[] = [
    {
      title: 'Title',
      priority: false,
      sortable: false,
    },
    {
      title: 'Speakers',
      priority: false,
      sortable: false,
    },
    {
      title: 'Bookmarks',
      priority: false,
      sortable: true,
      sortDirections: ['ascend', 'descend', null],
      sortField: 'bookmarks'
    },
    {
      title: 'Ratings',
      priority: false,
      sortable: true,
      sortDirections: ['ascend', 'descend', null],
      sortField: 'rates'
    },
    {
      title: 'Average Rating',
      priority: false,
      sortable: true,
      sortDirections: ['ascend', 'descend', null],
      sortField: 'avg_rate'
    }
  ];

  listOfData: DataItem[] = [];
  filteredData: DataItem[] = [];
  searchTerm: string = '';

  currentOrderField?: string;
  currentOrderDirection?: string;

  ngOnInit(): void {
    this.loadConferences();

    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['search'] || '';
      this.currentOrderField = params['orderField'];
      this.currentOrderDirection = params['orderDirection'];
      this.filterData();
    });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { sort } = params;
    const currentSort = sort.find(item => item.value !== null);
    
    if (currentSort) {
      // Ensure `key` is a number and use it to access listOfColumn
      const sortIndex = Number(currentSort.key); // Convert key to a number
  
      // Make sure to check if sortIndex is a valid index
      if (sortIndex >= 0 && sortIndex < this.listOfColumn.length) {
        const column = this.listOfColumn[sortIndex];
  
        // Type guard to ensure column is a SortableColumnItem
        if (this.isSortableColumnItem(column)) {
          this.currentOrderField = column.sortField;
          this.currentOrderDirection = currentSort.value || undefined;
  
          // Update URL with sort parameters
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
              orderField: this.currentOrderField,
              orderDirection: this.currentOrderDirection
            },
            queryParamsHandling: 'merge'
          });
  
          this.loadConferences();
        }
      }
    }
  }
  
  // Type guard to ensure the column is SortableColumnItem
  isSortableColumnItem(item: ColumnItem): item is SortableColumnItem {
    return item.sortable === true;
  }

  onSortOrderChange(sortField: string, sortOrder: NzTableSortOrder): void {
    this.currentOrderField = sortField;
    this.currentOrderDirection = sortOrder || undefined;

    // Update URL with the new sort parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        orderField: this.currentOrderField,
        orderDirection: this.currentOrderDirection,
      },
      queryParamsHandling: 'merge',
    });

    // Reload data with the new sorting applied
    this.loadConferences();
  }

  /** Load conferences from the service */
  loadConferences(): void {
    this.loading = true;
    this.adminService.getConferences(this.currentOrderField, this.currentOrderDirection)
    .subscribe({
      next: (data: DataItem[]) => {
        this.listOfData = data;
        this.filterData();
        this.loading = false;
      },
      error: error => {
        console.error('Error loading conferences', error);
        this.loading = false;
      }
    });
}

  /** Filter data based on searchTerm */
  filterData(): void {
    if (this.searchTerm) {
      const searchTermLower = this.searchTerm.toLowerCase();
      this.filteredData = this.listOfData.filter(item =>
        item.title.toLowerCase().includes(searchTermLower) ||
        item.speakers.toLowerCase().includes(searchTermLower) // Search in speakers
      );
    } else {
      this.filteredData = this.listOfData;
    }
  }

  exportTalksCsv(): void {
    this.isExporting = true;
    this.adminService.exportTalksCsv();
    // You might want to add a timeout or other mechanism to reset isExporting
    // since the download happens outside Angular's change detection
    setTimeout(() => this.isExporting = false, 1000);
  }
}
