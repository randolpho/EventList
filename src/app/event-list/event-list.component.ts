import {Component, OnInit} from '@angular/core';
import {EventService} from '../event.service';
import 'rxjs/add/operator/retry';
import {EventImage, EventInstance, EventList} from '../model/Event';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
  eventList: EventList;
  loading: boolean;
  saving: boolean;
  selectedEvent: EventInstance;

  constructor(private eventService: EventService) {
    this.saving = false;
  }

  ngOnInit() {
    this.loading = true;
    this.loadEvents();
  }

  loadEvents() {
    this.eventList = new EventList(new Date(), []);
    const observ = this.eventService.getEvents();
    observ.subscribe(events => {
      this.eventList = events;
      this.loading = false;
    });
  }

  onDetails(event: EventInstance) {
    this.selectedEvent = event;
  }

  getThumbnail(event: EventInstance): EventImage {
    if (!event) {
      return null;
    }
    if (event.images) {
      return null;
    }
    if (event.images.length === 0) {
      return null;
    }
    return event.images[0];
  }
}
