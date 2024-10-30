import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule, NzTableSortOrder } from 'ng-zorro-antd/table';
import { AdminService } from '../../../services/admin.service';
import { ActivatedRoute } from '@angular/router';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';
import * as models from '../../../shared/models';

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

  listOfColumn: models.ColumnItem[] = [
    {
      title: 'Title',
      priority: false,
      sortable: false,
      width: '35%'
    },
    {
      title: 'Speakers',
      priority: false,
      sortable: false,
      width: '20%'
    },
    {
      title: 'Bookmarks',
      priority: false,
      sortable: true,
      sortDirections: ['ascend', 'descend', null],
      sortField: 'bookmarks',
      width: '15%'
    },
    {
      title: 'Ratings',
      priority: false,
      sortable: true,
      sortDirections: ['ascend', 'descend', null],
      sortField: 'rates',
      width: '15%'
    },
    {
      title: 'Average Rating',
      priority: false,
      sortable: true,
      sortDirections: ['ascend', 'descend', null],
      sortField: 'avg_rate',
      width: '15%'
    }
  ];

  listOfData: models.TalksDataItem[] = [];
  filteredData: models.TalksDataItem[] = [];
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
  
          this.loadConferences();
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
    this.loadConferences();
  }

  /** Load conferences from the service */
  loadConferences(): void {
    this.loading = true;
    this.adminService.getConferences(this.currentOrderField, this.currentOrderDirection)
    .subscribe({
      next: (data: models.TalksDataItem[]) => {
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
    setTimeout(() => this.isExporting = false, 1000);
  }
}
