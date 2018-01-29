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
  @Input() isThumbnail = false;
  public imageSource: SafeUrl;
  public imageCaption: string;

  constructor(private eventService: EventService,
              private sanitizer: DomSanitizer) { }

  ngOnInit() {
    if (!this.image) {
      this.imageSource = '/assets/missing.png';
      this.imageCaption = "";
      return;
    }
    this.imageSource = '/assets/loading.gif';
    this.imageCaption = this.image.caption;
    if (this.image.url) {
      this.setImageSource();
      return;
    }
    const sub = this.eventService.getImage(this.eventId, this.image.id);
    sub.subscribe(url => {
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
