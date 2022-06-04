import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { NgxGaugeModule } from 'ngx-gauge';

import { AppComponent } from './app.component';
import { HomePage } from './home/home.page';

@NgModule({
  declarations: [AppComponent,HomePage],
  imports: [BrowserModule, IonicModule.forRoot(),NgxGaugeModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
