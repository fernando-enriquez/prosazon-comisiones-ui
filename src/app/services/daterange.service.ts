import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DaterangeService {

  private dateRange = new Subject<Date[]>();

  changeDateRange$ = this.dateRange.asObservable();

  constructor() { }

  changeDateRange(dateRange: any) {
    localStorage.setItem("daterange", dateRange);
    this.dateRange.next(dateRange);
  }

  public removeDateRange() {
    localStorage.removeItem("daterange");
  }
}
