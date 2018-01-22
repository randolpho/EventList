export class EventList {
  constructor(public dateFetched: Date,
              public events: Array<EventInstance>) { }
}

export class EventInstance {
  comments: Array<EventComment>;
  date: Date;
  description: string;
  id: string;
  images: Array<EventImage>;
  location: EventLocation;
  name: string;
  thumbnail: EventImage;
  status: EventStatus;
}

export class EventComment {
  from: string;
  text: string;
}

export class EventImage {
  id: string;
  url: string;
  caption: string;
}

export class EventLocation {
  address: string;
  city: string;
  name: string;
  state: string;
}

export  class EventStatus {
  loading: boolean;
  going: boolean;
  error: boolean;
}


