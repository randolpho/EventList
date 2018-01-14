import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/observable';

@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {
  // This normally would be obtained from a separate service after user login.
  public static username: string = "anything";
  public static password: string = "evalpass";
  private userpass = `${BasicAuthInterceptor.username}:${BasicAuthInterceptor.password}`;
  private encoded = btoa(this.userpass);

  intercept (request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const auth = request.clone({
      headers: request.headers.set(
        "Authorization", `Basic ${this.encoded}`)
    });
    return next.handle(auth);
  }
}
