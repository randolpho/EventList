import {Component, Input, OnInit} from '@angular/core';
import {EventImage, EventInstance} from '../model/Event';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent implements OnInit {
  @Input() event: EventInstance;

  constructor() { }

  ngOnInit() {
  }

}
