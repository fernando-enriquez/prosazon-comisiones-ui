import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment.prod";

@Injectable({
  providedIn: 'root'
})
export class AtributosServiceService {

  SERVER_API: string = environment.SERVER_API;
  RESOURCE:string =  "Rutas/Atributos";
  
  constructor(private http: HttpClient) { }

  public getAttributesByRoute(rutaId:string) {
    return this.http.get(`${this.SERVER_API}/${this.RESOURCE}/${rutaId}`);
  }

  public saveAttributes(data:any) {
    return this.http.post(`${this.SERVER_API}/${this.RESOURCE}/`,data);
  }
}
