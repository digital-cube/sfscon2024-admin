import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule, NzTableSortOrder } from 'ng-zorro-antd/table';
import { AdminService } from '../../../services/admin.service';
import { DateFormatPipe } from '../../../shared/date-format.pipe';
import { ActivatedRoute } from '@angular/router';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import * as models from '../../../shared/models';

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
export class AttendeesComponent implements OnInit {
  adminService = inject(AdminService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  isExporting = false;
  loading = false;

  listOfColumn: models.ColumnItem[] = [
    {
      title: 'ID',
      priority: false,
      sortable: false,
      width: '40%'
    },
    {
      title: 'Bookmarks',
      priority: 3,
      sortable: true,
      sortDirections: ['ascend', 'descend', null],
      sortField: 'bookmarks',
      width: '20%'
    },
    {
      title: 'Number of ratings',
      priority: 2,
      sortable: true,
      sortDirections: ['ascend', 'descend', null],
      sortField: 'nr_ratings',
      width: '20%'
    },
    {
      title: 'Registered',
      priority: 1,
      sortable: true,
      sortDirections: ['ascend', 'descend', null],
      sortField: 'register_at',
      width: '20%'
    }
  ];

  listOfData: models.AttendeesDataItem[] = [];
  filteredData: models.AttendeesDataItem[] = [];
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
      const sortIndex = Number(currentSort.key);
  
      if (sortIndex >= 0 && sortIndex < this.listOfColumn.length) {
        const column = this.listOfColumn[sortIndex];
  
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
  
  isSortableColumnItem(item: models.ColumnItem): item is models.SortableColumnItem {
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
        next: (data: models.AttendeesDataItem[]) => {
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
    setTimeout(() => this.isExporting = false, 1000);
  }
}
