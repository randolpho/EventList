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
  selectedEvent: EventInstance;
  private maxDescriptionLength = 150;

  constructor(private eventService: EventService) {
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

  truncateDescription(text: string) {
    if (text.length < this.maxDescriptionLength) {
      return text;
    }
    return text.substring(0, this.maxDescriptionLength) + ' ...';
  }
}
