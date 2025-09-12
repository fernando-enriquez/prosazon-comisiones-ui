import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment.prod";
import { HttpClient } from "@angular/common/http";


@Injectable({
  providedIn: 'root'
})
export class DatosTiempoRealService {
  SERVER_API: string = environment.SERVER_API;
  RESOURCE:string =  "DatosTiempoReal";

  constructor(private http: HttpClient) { }

  public getCardsSummary(filtros: any) {
    return this.http.post(`${this.SERVER_API}/${this.RESOURCE}/ResumenTarjetas`, filtros);
  }

  public getConversations(filtros: any) {
    return this.http.post(`${this.SERVER_API}/${this.RESOURCE}/Conversaciones`, filtros);
  }
}
