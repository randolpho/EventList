import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {EventService} from '../event.service';
import {observable} from 'rxjs/symbol/observable';
import {EventStatus} from '../model/Event';

@Component({
  selector: 'app-event-status',
  templateUrl: './event-status.component.html',
  styleUrls: ['./event-status.component.css']
})
export class EventStatusComponent implements OnInit {
  @Input() status: EventStatus;
  @Output() statusChange: EventEmitter<EventStatus> = new EventEmitter<EventStatus>();
  @Input() eventId: string;

  constructor(private eventService: EventService) {
  }

  ngOnInit() {
    if (!this.status) {
      this.status = new EventStatus();
      this.status.loading = true;
      this.statusChange.emit(this.status);
      const obsrv = this.eventService.getStatus(this.eventId);
      obsrv.subscribe(status => {
        this.status.loading = false;
        this.status.error = false;
        if (status) {
          this.status.going = true;
        } else {
          this.status.going = false;
        }
      }, err => {
        this.status.loading = false;
        this.status.error = true;
      });
    }
  }

  setStatus(going: boolean) {
    this.status.loading = true;
    const obsrv = this.eventService.setStatus(this.eventId, going);
    obsrv.retry(200);
    obsrv.subscribe(status => {
      this.status.loading = false;
      this.status.going = going;
    }, err => {
      console.error("Error RSVPing to event");
      console.error(err);
      this.setStatus(going);
    });
  }
}
