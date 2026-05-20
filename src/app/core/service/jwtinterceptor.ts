import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, Observable, throwError } from "rxjs";
import { GLOBALVARIABLE } from "../../config/global";

@Injectable({
    providedIn: 'root'
})
export class JwtInterceptorService implements HttpInterceptor {
    constructor(private router: Router) {

    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {

        if (sessionStorage.length > 0) {
            let token = sessionStorage.getItem(GLOBALVARIABLE.TOKEN)
            if (token !== undefined && token !== null) {
                request = request.clone({
                    setHeaders: {
                        AUTHTOKEN: sessionStorage.getItem(GLOBALVARIABLE.TOKEN),
                    }
                });
            }
        }

        let ignore =
            typeof request.body === "undefined"
            || request.body === null
            || request.body.toString() === "[object FormData]" // <-- This solves problem for publish the file.
            || request.headers.has("Content-Type");


        if (ignore) {
            return next.handle(request)
                .pipe(
                    catchError((error) => {
                        let errMsg = '';
                        // Client Side Error
                        if (error instanceof HttpErrorResponse) {
                            const errorDetail = error?.error?.errors === undefined ? error.error : error.error.errors;
                            if (error.status === 401) {
                                errMsg = `Error: ${errorDetail.message}`;
                                sessionStorage.clear();
                                this.router.navigate(['/']);
                            }
                            if (error.status === 400) {
                                errMsg = `Error: ${errorDetail.message}`;
                            }
                            else if (errorDetail?.MessageDetail) {
                                errMsg = errorDetail.MessageDetail;
                            }
                            else if (errorDetail?.length > 0) {
                                errMsg = `Error: ${errorDetail[0].Message}`;
                            }
                            else {
                                //errMsg = `Error: ${error.error}`;
                                errMsg = error as any;
                            }
                        }
                        else {  // Server Side Error
                            errMsg = `Error Code: ${error},  Message: ${error}`;
                            //errMsg = error;
                        }
                        return throwError(errMsg);
                    })
                );;
        }


        request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
        return next.handle(request)
            .pipe(
                catchError((error) => {

                    let errMsg = '';
                    // Client Side Error
                    if (error instanceof HttpErrorResponse) {
                        const errorDetail = error.error.errors === undefined ? error.error : error.error.errors;
                        if (error.status === 401) {
                            errMsg = `Error: ${errorDetail.message}`;
                            sessionStorage.clear();
                            this.router.navigate(['/']);
                        }
                        if (error.status === 400) {
                            errMsg = `Error: ${errorDetail.message}`;
                        }
                        else if (errorDetail.MessageDetail) {
                            errMsg = errorDetail.MessageDetail;
                        }
                        else if (errorDetail.length > 0) {
                            errMsg = `Error: ${errorDetail[0].Message}`;
                        }
                        else {
                            errMsg = `Error: ${error.error}`;
                        }
                    }
                    else {  // Server Side Error
                        errMsg = `Error Code: ${error},  Message: ${error}`;
                    }
                    return throwError(errMsg);
                })
            );
    }
}