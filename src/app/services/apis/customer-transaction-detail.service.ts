import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class CustomerTransactionDetailService {
  SERVER_API: string = environment.SERVER_API2;
  CONTROLLER: string = "/CustomerTransactionDetail";

  constructor(private http: HttpClient) { }

  public get(params: any){
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === "T") {
        delete params[key];
      }
    });

    let options = {
      params: params
    }
    return this.http.get(`${this.SERVER_API}${this.CONTROLLER}`,options);
  }

  public post(body: any) {
    return this.http.post(`${this.SERVER_API}${this.CONTROLLER}`, body);
  }
}
