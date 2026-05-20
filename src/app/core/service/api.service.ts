import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { forkJoin, Observable } from "rxjs";
import { GLOBALVARIABLE } from "../../config/global";
import { Utilities } from "../../config/util";
declare const getUrl: any;
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private actionUrl: string;
  public serverWithApiUrl = GLOBALVARIABLE.SERVER_LINK + GLOBALVARIABLE.API_LINK;
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    responseType: 'text' as 'json',
  };
  constructor(
    private http: HttpClient
  ) {
    this.actionUrl = this.serverWithApiUrl;
  }
  public getData<T>(apiMethod: any): Observable<T> {
    return this.http.get<T>(this.actionUrl + apiMethod);
  }
  public getJson<T>(url: any): Observable<T> {
    return this.http.get<T>(url);
  }
  public getDataByParam<T>(
    apiMethod: any,
    paramVal: any,
    paramName: any
  ): Observable<T> {
    let params = new HttpParams();
    if (Utilities.isString(paramVal)) {
      params.append(paramName, paramVal);
    } else if (Utilities.isArray(paramVal)) {
      paramVal.forEach((actorName: string) => {
        params = params.append(paramName, actorName);
      });
    }
    return this.http.get<T>(this.actionUrl + apiMethod, { params });
  }
  public postData<T>(apiMethod: string, param: any): Observable<T> {
    return this.http.post<T>(
      this.actionUrl + apiMethod,
      JSON.stringify(param),
      this.httpOptions
    );
  }
  public externalAPI<T>(userURL: string): Observable<T> {
    return this.http.get<T>(userURL);
  }

  public update<T>(id: number, itemToUpdate: any): Observable<T> {
    return this.http.put<T>(this.actionUrl + id, itemToUpdate);
  }

  public delete<T>(id: number): Observable<T> {
    return this.http.delete<T>(this.actionUrl + id);
  }
  public multiCall(api: any[]) {
    const urls = [];
    api.forEach((x) => {
      urls.push(this.http.get(this.actionUrl + x));
    });
    return forkJoin(urls);
  }

  public getFileData<T>(path: string): Observable<T> {
    return this.http.get<T>(path, this.httpOptions);
  }

  public upload(apiMethod, formData) {

    let headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    headers.append('Accept', 'application/json');
    const httpOptions = { headers: headers };

    return this.http.post(this.actionUrl + apiMethod, formData, httpOptions)
  }
}
