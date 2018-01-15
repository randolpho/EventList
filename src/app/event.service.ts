import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/observable';
import {HttpClient} from '@angular/common/http';
import {BasicAuthInterceptor} from './model/BasicAuthInterceptor';
import {EventInstance, EventList} from './model/Event';
import {LocalStorageService} from './local-storage.service';
import {of} from 'rxjs/observable/of';

@Injectable()
export class EventService {
  private rootUrl: string = 'http://dev.dragonflyathletics.com:1337/api/dfkey/';
  private numRetries: number = 200;

  constructor(private http: HttpClient, private ls: LocalStorageService) {
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

  getStatus(id: string): Observable<any> {
    const url = this.statusUrl(id, BasicAuthInterceptor.username);
    const response = this.http.get(url);
    return response;
  }

  getImage(id: string, mediaId: string): Observable<string> {
    if (!window) {
      return of('/assets/missing.png');
    }
    const observable = Observable.create(observer => {
      const url = this.mediaUrl(id, mediaId);
      const req = this.http.get(url, {responseType: 'blob'});
      req.subscribe(blob => {
        if (blob.type.startsWith('image/')) {
          const objUrl = URL.createObjectURL(blob);
          observer.next(objUrl);
          observer.complete();
        }
      }, error => {
        console.error(`Error fetching image ${url}`);
        console.error(error);
        // observer.next("/assets/missing.png");
        // observer.complete();
      });
    });
    return observable;
  }

  setStatus(id: string, coming: boolean) {
    const url = this.statusUrl(id, BasicAuthInterceptor.username);
    const response = this.http.put(url, {coming: coming});
    // response.retry(this.numRetries);
    return response;
  }

  // getStatus(id: string): Observable<boolean> {
  //   const observable = Observable.create(observer => {
  //     const url = this.statusUrl(id, BasicAuthInterceptor.username);
  //     const statusObservable = this.http.get(url);
  //     statusObservable.subscribe(status => {
  //       if (status) {
  //         observer.next(true);
  //       } else {
  //         observer.next(false);
  //       }
  //       observer.complete();
  //     }, err => {
  //       console.error(`Error getting status at url ${url}.`);
  //       console.error(err);
  //       observer.complete();
  //     });
  //   });
  //   return observable;
  // }
  // getStatuses(events: Array<EventInstance>): Observable<any> {
  //   const observers = [];
  //   for (const event of events) {
  //     // this little hack should let me forkJoin without quitting mid-stream on an
  //     // error. Fingers crossed
  //     const observable = Observable.create(observer => {
  //       const url = this.statusUrl(event.id, BasicAuthInterceptor.username);
  //       const statusObserver = this.http.get(url);
  //       // statusObserver.retry(this.numRetries);
  //       statusObserver.subscribe(data => {
  //         const attending = {attending: false};
  //         if (data) {
  //           attending.attending = true;
  //         }
  //         this.ls.set(url, attending);
  //         Object.assign(event, attending);
  //         observer.complete();
  //       }, err => {
  //         console.error(`Error getting status at url ${url}. Using local storage, if available`);
  //         console.error(err);
  //         let attending = this.ls.get(url);
  //         if (!attending) {
  //           attending = {attending: false};
  //         }
  //         Object.assign(event, attending);
  //         observer.complete();
  //       });
  //     });
  //     observers.push(observable);
  //   }
  //   return forkJoin(observers);
  // }
  //

  buildThumbnails(events: Array<EventInstance>) {
    for (const event of events) {
      if (event.images && event.images.length > 0) {
        event.thumbnail = event.images[0];
      }
    }
  }

  getEvents(): Observable<EventList> {
    const observable = Observable.create(observer => {
      const url = this.eventsUrl();
      const eventsObservable = this.http.get(url);
      eventsObservable.subscribe(events => {
        if (events instanceof Array) {
          this.buildThumbnails(events);
          const eventList = new EventList(new Date(), events);
          observer.next(eventList);
          observer.complete();
          this.ls.set(url, eventList);
        } else {
          observer.next(this.ls.get(url) as EventList);
          observer.complete();
        }
      }, error => {
        console.error('Error fetching event list. Returning local storage version, if available.');
        console.error(error);
        observer.next(this.ls.get(url) as EventList);
        observer.complete();
      });
    });
    return observable;
  }

  // getEventList(): Observable<Array<EventInstance>> {
  //   const observable = Observable.create(observer => {
  //     const url = this.eventsUrl();
  //     const eventsObservable = this.http.get(url);
  //     // eventsObservable.retry(this.numRetries);
  //     eventsObservable.subscribe(events => {
  //       if (events instanceof Array) {
  //         this.buildThumbnailUrls(events);
  //         const statusesObservable = this.getStatuses(events);
  //         statusesObservable.subscribe(ignored => {
  //         }, err => {
  //           console.error('Error fetching event statuses. Returning local storage events, if available.');
  //           console.error(err);
  //           observer.next(this.ls.get(url) as Array<EventInstance>);
  //           observer.complete();
  //
  //         }, () => {
  //           this.ls.set(url, events);
  //           observer.next(events);
  //           observer.complete();
  //         });
  //       } else {
  //         observer.next(this.ls.get(url) as Array<EventInstance>);
  //         observer.complete();
  //       }
  //     }, error => {
  //       console.error('Error fetching event list. Returning local storage version, if available.');
  //       console.error(error);
  //       observer.next(this.ls.get(url) as Array<EventInstance>);
  //       observer.complete();
  //     });
  //   });
  //   return observable;
  // }
}
