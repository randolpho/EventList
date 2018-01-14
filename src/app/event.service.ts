import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/observable';
import {HttpClient} from '@angular/common/http';
import {BasicAuthInterceptor} from './model/BasicAuthInterceptor';
import {mergeMap, map} from 'rxjs/operators';
import {EventInstance} from './model/Event';
import {forkJoin} from 'rxjs/observable/forkJoin';

@Injectable()
export class EventService {
  private rootUrl: string = 'http://dev.dragonflyathletics.com:1337/api/dfkey/';
  private numRetries: number = 200;

  constructor(private http: HttpClient) {
  }

  buildUrl(endpoint: string): string {
    return this.rootUrl + endpoint;
  }

  eventsUrl(): string {
    return this.buildUrl('events');
  }

  mediaUrl(eventId: string, mediaId: string) {
    return this.buildUrl(`events/${eventId}/media/${mediaId}`);
  }

  statusUrl(eventId: string, username: string) {
    return this.buildUrl(`events/${eventId}/status/${username}`);
  }

  getEvents(): Observable<any> {
    const url = this.eventsUrl();
    const response = this.http.get(url);
    response.retry(this.numRetries);
    return response;
  }

  getStatus(id: string): Observable<any> {
    const url = this.statusUrl(id, BasicAuthInterceptor.username);
    const response = this.http.get(url);
    response.retry(this.numRetries);
    return response;
  }

  setStatus(id: string, coming: boolean) {
    const url = this.statusUrl(id, BasicAuthInterceptor.username);
    const response = this.http.put(url, {coming: coming});
    response.retry(this.numRetries);
    return response;
  }

  getEventsAndStatus(): Observable<Array<Event>> {
    const url = this.eventsUrl();
    const response = this.http.get<Array<Event>>(url);
    response.retry(this.numRetries);
    response.pipe(
      map(data => {
        if (data instanceof Array) {
          return data;
        }
        return null;
      }),
      mergeMap(event => {
        if (event) {
          const mergedResponse = this.getStatus('event.id');
          mergedResponse.pipe(
            map(status => {
              const attending = {attending: false};
              if (status) {
                attending.attending = true;
              }
              return Object.assign(event, attending);
            })
          );
          return mergedResponse;
        }
      })
    );
    return response;
  }

  getStatuses(events: Array<EventInstance>): Observable<any> {
    const observers = [];
    for (const event of events) {
      // this little hack should let me forkJoin without quitting mid-stream on an
      // error. Fingers crossed
      const observable = Observable.create(observer => {
        const statusObserver = this.getStatus(event.id);
        statusObserver.retry(this.numRetries);
        statusObserver.subscribe(data => {
          const attending = {attending: false};
          if (data) {
            attending.attending = true;
          }
          Object.assign(event, attending);
          observer.complete();
        }, err => {
          console.log(`Error getting status for id ${event.id}`);
          console.log(err);
          observer.complete();
        });
      });
      observers.push(observable);
    }
    const result = forkJoin(observers);
    return result;
  }
}
