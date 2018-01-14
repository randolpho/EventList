export class EventInstance {
  comments: Array<EventComment>;
  date: string;
  description: string;
  id: string;
  images: Array<EventImage>;
  location: EventLocation;
  name: string;
  image: string;
  thumbnailUrl: string;
  attending: boolean;
}

export class EventComment {
  from: string;
  text: string;
}

export class EventImage {
  id: string;
  caption: string;
}

export class EventLocation {
  address: string;
  city: string;
  name: string;
  state: string;
}
