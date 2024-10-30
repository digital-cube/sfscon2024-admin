import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  private datePipe: DatePipe;

  constructor() {
    this.datePipe = new DatePipe('en-US');
  }

  transform(value: string | Date, format: string = 'mediumDate'): string | null {
    if (!value) {
      return null;
    }
    return this.datePipe.transform(value, format);
  }
}
