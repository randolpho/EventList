import {Component, Input, OnInit} from '@angular/core';
import {EventService} from '../event.service';
import {EventImage} from '../model/Event';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-event-image',
  templateUrl: './event-image.component.html',
  styleUrls: ['./event-image.component.css']
})
export class EventImageComponent implements OnInit {
  @Input() image: EventImage;
  @Input() eventId: string;
  public imageSource: SafeUrl;

  constructor(private eventService: EventService,
              private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.imageSource = '/assets/loading.gif';
    if (!this.image) {
      this.imageSource = '/assets/missing.png';
      return;
    }
    if (this.image.url) {
      this.setImageSource();
      return;
    }
    const sub = this.eventService.getImage(this.eventId, this.image.id);
    sub.subscribe(url => {
      console.log(url);
      this.image.url = url;
      this.setImageSource();
    }, err => {
      console.log("Error loading image");
      console.log(err);
      this.imageSource = '/assets/missing.png';
    });
  }

  private setImageSource() {
    // this is necessary because by default Angular doesn't trust
    // javascript generated objects.
    this.imageSource = this.sanitizer.bypassSecurityTrustUrl(this.image.url);
  }
}
