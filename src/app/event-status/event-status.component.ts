import {Component, Input, OnInit} from '@angular/core';
import {EventService} from '../event.service';
import {LocalStorageService} from '../local-storage.service';

@Component({
  selector: 'app-event-status',
  templateUrl: './event-status.component.html',
  styleUrls: ['./event-status.component.css']
})
export class EventStatusComponent implements OnInit {
  @Input() eventId: string;
  loading: boolean;
  error: boolean;
  going: boolean;

  constructor(private eventService: EventService,
              private ls: LocalStorageService) {
  }


  ngOnInit() {
    this.loading = true;
    this.error = false;
    const cachedGoing = this.ls.get(this.getKey());
    if (cachedGoing === null) {
      this.loadStatus();
    } else {
      this.going = cachedGoing;
      this.loading = false;
      this.loadStatus();
    }
  }

  loadStatus() {
    const key = this.getKey();
    const obsrv = this.eventService.getStatus(this.eventId);
    obsrv.subscribe(status => {
      this.loading = false;
      if (status) {
        this.going = status.coming;
        this.ls.set(key, this.going);
      } else {
        this.error = true;
        this.ls.set(key, null);
      }
    }, err => {
      this.loading = false;
      this.error = true;
      this.ls.set(key, null);
      console.error('Error obtaining status');
      console.error(err);
    });

  }

  setStatus(going: boolean) {
    this.loading = true;
    this.error = false;
    const obsrv = this.eventService.setStatus(this.eventId, going);
    obsrv.retry(200);
    obsrv.subscribe(() => {
      this.loading = false;
      this.going = going;
      this.ls.set(this.getKey(), this.going);
    }, err => {
      console.error('Error RSVPing to event');
      console.error(err);
      this.setStatus(going);
    });
  }

  private getKey() {
    return 'EventId: ' + this.eventId;
  }
}
