import { AuthService } from '../service/auth.service';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { getIdleTimeout, GLOBALVARIABLE, setIdleTimeout } from 'src/app/config/global';
import { Router } from '@angular/router';
import { Idle } from '@ng-idle/core';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthService,
    private router: Router,
    private idle: Idle,) {}
  
  _refeshCount = 0;

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe( 
      catchError((err) => {
        if (err.status === 401) {
          // auto logout if 401 response returned from api
          
          //this.authenticationService.logout();
          let isIdleTimeOut = getIdleTimeout();
          console.log("401",err,isIdleTimeOut);
          if(isIdleTimeOut) {
            this.authenticationService.logout();
            this.router.navigate(['/authentication/signin']); 
            setIdleTimeout(false);
          } else{
            setIdleTimeout(false);
            if(this._refeshCount < 5){
              this.authenticationService.refeshToken().subscribe(
                {
                  next : (value: any) =>{
                    value = JSON.parse(value);
                    console.log("refesh Token value ",value);
                    sessionStorage.setItem(GLOBALVARIABLE.TOKEN, value.Token);
                    sessionStorage.setItem(GLOBALVARIABLE.REFRESHTOKEN, value.RefreshToken);
                    this._refeshCount = 0;
                    let url = this.router.url;
                    console.log("before route", url);
                    location.reload();
                    // this.router.navigate(['/']).then(() => {
                    //   console.log("then route", url);
                    //   this.router.navigate([url]);
                    // }); 
                   
                    //location.reload();
              
                  },
                  error:err =>{
                    console.log("refesh Token error ",err);
                    this._refeshCount = this._refeshCount +1;
                  }
                }
              );
            }
          }
          //location.reload();
        }

        const error = err.error || err.statusText;
        return throwError(error);
      })
    );
  }
}




