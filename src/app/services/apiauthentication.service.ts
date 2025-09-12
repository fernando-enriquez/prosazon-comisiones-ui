import { Injectable } from '@angular/core';
import { environment } from "../../environments/environment.prod";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ApiauthenticationService {
  AUTHENTICATION_SERVER: string = environment.AUTHENTICATION_SERVER;

  accessToken: any;
  refreshToken: any;

  constructor(private http: HttpClient) { 
    this.leerToken();
  }

  public postAuthenticationLogin(login: any) {
    return this.http.post(`${this.AUTHENTICATION_SERVER}/auth/signin`, login);
  }

  public postAuthenticationRecoverAccountEmail(email: any) {
    return this.http.post(`${this.AUTHENTICATION_SERVER}/Authentication/RecoverAccountEmail`, email);
  }

  public postAuthenticationRecoverAccountTokenValidation(token: any) {
    return this.http.post(`${this.AUTHENTICATION_SERVER}/Authentication/RecoverAccountTokenValidation`, token);
  }

  public postAuthenticationRecoverAccountPassword(recoveraccountPassword: any) {
    return this.http.post(`${this.AUTHENTICATION_SERVER}/Authentication/RecoverAccountPassword`, recoveraccountPassword);
  }

  public postAuthenticationRefresh(refreshToken: any) {
    return this.http.post(`${this.AUTHENTICATION_SERVER}/Authentication/Refresh`, refreshToken);
  }

  public deleteAuthenticationLogout() {
    return this.http.delete(`${this.AUTHENTICATION_SERVER}/Authentication/Logout`);
  }

  guardarToken(accessToken: any, refreshToken: any) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  leerToken() {
    if (localStorage.getItem('accessToken')) {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
    } else {
      this.accessToken = '';
      this.refreshToken = '';
    }
    return this.accessToken;
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    this.accessToken = '';
    this.refreshToken = '';
  }
}
