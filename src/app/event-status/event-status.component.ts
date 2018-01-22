import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {EventService} from '../event.service';
import {EventStatus} from '../model/Event';
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

  constructor(private eventService: EventService, private ls: LocalStorageService) {
  }

  ngOnInit() {
    this.loading = true;
    this.error = false;
    const key = 'EventId: ' + this.eventId;
    const cachedGoing = this.ls.get(key);
    if (cachedGoing) {
      this.going = true;
    } else {
      this.going = false;
    }
    const obsrv = this.eventService.getStatus(this.eventId);
    obsrv.subscribe(status => {
      this.loading = false;
      if (status) {
        this.going = true;
        this.ls.set(key, this.going);
      } else {
        this.going = false;
        this.ls.set(key, null);
      }
    }, err => {
      this.loading = false;
      this.error = true;
      console.error('Error obtaining status');
      console.error(err);
    });

    //
    // if (!this.status) {
    //   this.status = new EventStatus();
    //   this.status.loading = true;
    //   this.statusChange.emit(this.status);
    //   const obsrv = this.eventService.getStatus(this.eventId);
    //   obsrv.subscribe(status => {
    //     this.status.loading = false;
    //     this.status.error = false;
    //     if (status) {
    //       this.status.going = true;
    //     } else {
    //       this.status.going = false;
    //     }
    //   }, err => {
    //     this.status.loading = false;
    //     this.status.error = true;
    //   });
    // }
  }

  setStatus(going: boolean) {
    this.loading = true;
    const obsrv = this.eventService.setStatus(this.eventId, going);
    obsrv.retry(200);
    obsrv.subscribe(status => {
      this.loading = false;
      this.going = going;
    }, err => {
      console.error('Error RSVPing to event');
      console.error(err);
      this.setStatus(going);
    });
  }
}
