import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';


import {AppComponent} from './app.component';
import {EventListComponent} from './event-list/event-list.component';
import {EventService} from './event.service';
import {BasicAuthInterceptor} from './model/BasicAuthInterceptor';
import {LocalStorageService} from './local-storage.service';
import {EventImageComponent} from './event-image/event-image.component';
import {EventStatusComponent} from './event-status/event-status.component';
import {CommonModule} from '@angular/common';


@NgModule(<NgModule>{
  declarations: [
    AppComponent,
    EventListComponent,
    EventImageComponent,
    EventStatusComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    CommonModule
  ],
  providers: [EventService,
    LocalStorageService, {
    provide: HTTP_INTERCEPTORS,
    useClass: BasicAuthInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
