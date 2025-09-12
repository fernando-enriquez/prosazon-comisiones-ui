import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
    providedIn: 'root'
  })

  export class AttendanceSheetService
  {
    //SERVER_API: string = environment.SERVER_API;
    SERVER_API: string = environment.SERVER_API;
    CONTROLLER: string = "AttendanceSheet";

    constructor(private http: HttpClient) { }

    public postAttendanceSheet(AttendanceSheet:any){
        return this.http.post(`${this.SERVER_API}/${this.CONTROLLER}`, AttendanceSheet);
    }
  }