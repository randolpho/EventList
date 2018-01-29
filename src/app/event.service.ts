import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/observable';
import {HttpClient} from '@angular/common/http';
import {BasicAuthInterceptor} from './model/BasicAuthInterceptor';
import {EventInstance, EventList} from './model/Event';
import {LocalStorageService} from './local-storage.service';
import {of} from 'rxjs/observable/of';

@Injectable()
export class EventService {
  private rootUrl = 'http://dev.dragonflyathletics.com:1337/api/dfkey/';

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
    return Observable.create(observer => {
      if (!window) {
        observer.error('No window object');
        return;
      }
      const url = this.mediaUrl(id, mediaId);
      const req = this.http.get(url, {responseType: 'blob'});
      req.subscribe(blob => {
        if (blob.type.startsWith('image/')) {
          const objUrl = URL.createObjectURL(blob);
          observer.next(objUrl);
          observer.complete();
        } else {
          // we didn't receive an image in the response body. Let the component handle it as an error
          observer.error('no image received');
          observer.complete();
        }
      }, error => {
        observer.error(error);
        observer.complete();
      });
    });
  }

  setStatus(id: string, coming: boolean) {
    const url = this.statusUrl(id, BasicAuthInterceptor.username);
    const response = this.http.put(url, {coming: coming});
    // response.retry(this.numRetries);
    return response;
  }

  getEvents(): Observable<EventList> {
    return Observable.create(observer => {
      const url = this.eventsUrl();
      const eventsObservable = this.http.get(url);
      eventsObservable.subscribe(events => {
        if (events instanceof Array) {
          this.buildThumbnails(events);
          const eventList = new EventList(new Date(), events);
          observer.next(eventList);
          observer.complete();
          this.cacheEventList(eventList);
        } else {
          const cachedEvents = this.getCachedEvents();
          if (cachedEvents) {
            observer.next(cachedEvents);
          }
        }
      }, error => {
        console.error('Error fetching event list. Returning local storage version, if available.');
        console.error(error);
        const cachedEvents = this.getCachedEvents();
        if (cachedEvents) {
          observer.next(cachedEvents);
        }
        observer.complete();
      });
    });
  }

  private buildThumbnails(events: Array<EventInstance>) {
    for (const event of events) {
      if (event.images && event.images.length > 0) {
        event.thumbnail = event.images[0];
      }
      event.date = new Date(event.date);
    }
  }

  private cacheEventList(events: EventList) {
    const cachedEvents = [];
    for (const event of events.events) {
      const cachedEvent = new EventInstance();
      cachedEvent.date = event.date;
      cachedEvent.description = event.description;
      cachedEvent.id = event.id;
      cachedEvent.name = event.name;
      cachedEvent.thumbnail = event.thumbnail;
      cachedEvent.location = event.location;
      cachedEvents.push(cachedEvent);
    }
    const cached = new EventList(events.dateFetched, cachedEvents);
    this.ls.set('EventList', cached);
  }

  private getCachedEvents(): EventList {
    const events = this.ls.get('EventList') as EventList;
    return events;
  }
}
