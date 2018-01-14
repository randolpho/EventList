import {Component, OnInit} from '@angular/core';
import {EventService} from '../event.service';
import 'rxjs/add/operator/retry';
import {EventInstance} from '../model/Event';
import {Observable} from 'rxjs/observable';

import {of} from 'rxjs/observable/of';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
  events: Array<EventInstance>;
  loading: boolean;


  constructor(private eventService: EventService) {
  }

  ngOnInit() {
    this.loadEvents();
    // this.eventService.getEventsAndStatus().subscribe(events => {
    //   this.events = events;
    // }, err => this.onError(err));
  }

  onError(error) {
    console.log('Error communicating with server');
    console.log(error);
  }

  onEventsLoaded(data) {
    if (data instanceof Array) {
      this.loadImages(data);
      const stream = this.eventService.getStatuses(data);
      stream.subscribe(events => {
        this.events = data;
      }, err => this.onError(err), () => {
        this.events = data;
      });
    } else {
      this.onError("Received bad data");
    }
  }

  loadEvents() {
    const eventsObserver = this.eventService.getEvents();
    eventsObserver.retry(100); // keep retrying
    eventsObserver.subscribe(data => this.onEventsLoaded(data),
      error => this.onError(error));
  }

  loadImages(events: Array<EventInstance>) {
    for (const event of events) {
      if (event.images.length > 0) {
        event.thumbnailUrl = this.eventService.mediaUrl(event.id, event.images[0].id);
      }
      // this.loadStatus(event);
    }
  }

  private loadStatus(event: EventInstance) {
    const eventResult = this.eventService.getStatus(event.id);
    eventResult.retry(100); // keep retrying
    eventResult.subscribe(data => {
      if(data) {
        event.attending = true;
      } else {
        event.attending = false;
      }
    }, error => this.onError(error));
  }
}
