import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import * as lz from "lz-string";

@Injectable()
export class LocalStorageService {
  private available: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.available = isPlatformBrowser(this.platformId);
  }

  get(key: string): any {
    if (!this.available) {
      return null;
    }
    const val = window.localStorage.getItem(key);
    if (!val) {
      return null;
    }
    try {
      return JSON.parse(val);
    } catch (e) {
      console.log(`Error retrieving key ${key} from local storage: ${e}`);
      return val;
    }
  }

  set(key: string, value: any) {
    if (!this.available) {
      return;
    }
    let val: string;
    if (typeof value === "string") {
      val = value;
    } else {
      val = JSON.stringify(value);
    }
    window.localStorage.setItem(key, val);
    // setTimeout(() => {
    // }, 10000);
  }
}
