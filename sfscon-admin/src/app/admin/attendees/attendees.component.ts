import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule, NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';
import { AdminService } from '../../../services/admin.service';
import { DateFormatPipe } from '../../../shared/date-format.pipe';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

interface DataItem {
  id: string;
  bookmarks: number;
  nr_ratings: number;
  register_at: any;
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
  selector: 'app-attendees',
  standalone: true,
  imports: [
    CommonModule,
    NzIconModule,
    NzButtonModule,
    NzAlertModule,
    NzInputModule,
    NzTableModule,
    DateFormatPipe
  ],
  templateUrl: './attendees.component.html',
  styleUrl: './attendees.component.scss'
})
export class AttendeesComponent {
  adminService = inject(AdminService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  isExporting = false;
  loading = false;

  listOfColumn: ColumnItem[] = [
    {
      title: 'ID',
      priority: false,
      sortable: false,
    },
    {
      title: 'Bookmarks',
      priority: 3,
      sortable: true,
      sortDirections: ['ascend', 'descend', null],
      sortField: 'bookmarks'
    },
    {
      title: 'Number of ratings',
      priority: 2,
      sortable: true,
      sortDirections: ['ascend', 'descend', null],
      sortField: 'nr_ratings'
    },
    {
      title: 'Registered',
      priority: 1,
      sortable: true,
      sortDirections: ['ascend', 'descend', null],
      sortField: 'register_at'
    }
  ];

  listOfData: DataItem[] = [];
  filteredData: DataItem[] = [];
  searchTerm: string = '';

  currentOrderField?: string;
  currentOrderDirection?: string;

  ngOnInit(): void {
    this.loadAttendees();

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
  
          this.loadAttendees();
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
    this.loadAttendees();
  }

  /** Load attendees from the service */
  loadAttendees(): void {
    this.loading = true;
    this.adminService.getAttendees(this.currentOrderField, this.currentOrderDirection)
      .subscribe({
        next: (data: DataItem[]) => {
          this.listOfData = data;
          this.filterData();
          this.loading = false;
        },
        error: error => {
          console.error('Error loading attendees', error);
          this.loading = false;
        }
      });
  }

  /** Filter data based on searchTerm */
  filterData(): void {
    const searchTerm = this.searchTerm.toLowerCase();

    this.filteredData = this.listOfData.filter(item => {
      return (
        item.id.toLowerCase().includes(searchTerm) ||
        item.bookmarks.toString().includes(searchTerm) ||
        item.nr_ratings.toString().includes(searchTerm) ||
        item.register_at.toLowerCase().includes(searchTerm)
      );
    });
  }

  exportAttendeesCsv(): void {
    this.isExporting = true;
    this.adminService.exportAttendeesCsv();
    // You might want to add a timeout or other mechanism to reset isExporting
    // since the download happens outside Angular's change detection
    setTimeout(() => this.isExporting = false, 1000);
  }
}
