import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';


import {AppComponent} from './app.component';
import {EventListComponent} from './event-list/event-list.component';
import {EventService} from './event.service';
import {BasicAuthInterceptor} from './model/BasicAuthInterceptor';


@NgModule(<NgModule>{
  declarations: [
    AppComponent,
    EventListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [EventService, {
    provide: HTTP_INTERCEPTORS,
    useClass: BasicAuthInterceptor,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
