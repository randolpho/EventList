///<reference path="model/Event.ts"/>
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {of} from 'rxjs/observable/of';
import {catchError, map, tap} from 'rxjs/operators';
import {Event} from './model/Event';
import {catchError} from 'rxjs/operators';

@Injectable()
export class EventService {
  private rootUrl: string = 'http://dev.dragonflyathletics.com:1337/api/dfkey/';
  private username: string = "anything";
  private password: string = "evalpass";
  private requestOptions;

  constructor(private http: HttpClient) {
    let userpass = `${this.username}:${this.password}`;
    let encoded = btoa(userpass);
    this.requestOptions = {
      headers: new HttpHeaders({
        "Authorization": `Basic ${encoded}`,
        "Content-Type": "application/json"
      })
    };
  }

  buildUrl(endpoint: string): string {
    return this.rootUrl + endpoint;
  }
  eventsUrl(): string {
    return this.buildUrl("events");
  }
  mediaUrl(eventId: string, mediaId: string){
    return this.buildUrl(`events/${eventId}/media/${mediaId}`);
  }
  statusUrl(eventId: string, username: string) {
    return this.buildUrl(`events/${eventId}/status/${username}`);
  }


  getEvents(): Observable<Event[]> {
    const url = this.eventsUrl();
    const result = this.http.get(url, this.requestOptions);
    result.pipe(
      tap(_ => {
        console.log("response returned");
      }),
      catchError(this.buildErrorHandler([]))
    );

    let userpass = `${this.username}:${this.password}`;
    let encoded = btoa(userpass);

    var xml = new XMLHttpRequest();
    xml.onreadystatechange = function() {
      console.log(xml.readyState);
    }
    xml.open("GET", url, true);
    xml.setRequestHeader("Authorization", `Basic ${encoded}`);
    xml.setRequestHeader("Content-Type", "application/json");
    xml.send();

    const events: Event[] = [];
    events.push(<Event>{name: "foo"});
    events.push(<Event>{name: "bar"});
    return of(events);
  }


  buildErrorHandler<T>(result?: T) {
    return (error: any): Observable<T> => {
      console.log(`Error: ${error}`);
      return of(result as T);
    };
  }
}
