import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment.prod";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class HorariosService {
  SERVER_API: string = environment.SERVER_API;
  RESOURCE:string =  "Rutas/HorariosRuta";

  constructor(private http: HttpClient) { }

  public getScheduleByRoute(rutaId:number) {
    return this.http.get(`${this.SERVER_API}/${this.RESOURCE}/${rutaId}`);
  }

  public saveSchedule(filters:any) {
    return this.http.post(`${this.SERVER_API}/${this.RESOURCE}/`,filters);
  }

  public deleteSchedule(scheduleId:string) {
    return this.http.delete(`${this.SERVER_API}/${this.RESOURCE}/${scheduleId}`);
  }
}
