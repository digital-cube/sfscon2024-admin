import { NzTableSortOrder } from 'ng-zorro-antd/table';

export interface AttendeesDataItem {
  id: string;
  bookmarks: number;
  nr_ratings: number;
  register_at: any;
}

export interface TalksDataItem {
    title: string;
    bookmarks: string;
    speakers: string;
    rates: number;
    avg_rate: number;
  }

export interface BaseColumnItem {
  title: string;
  priority: boolean | number;
  width?: string;
}

export interface SortableColumnItem extends BaseColumnItem {
  sortable: true;
  sortDirections: NzTableSortOrder[];
  sortField: string;
}

export interface NonSortableColumnItem extends BaseColumnItem {
  sortable: false;
}

export type ColumnItem = SortableColumnItem | NonSortableColumnItem;
