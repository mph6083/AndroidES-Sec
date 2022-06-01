/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable guard-for-in */
import { Component, OnInit } from '@angular/core';
import { SystemInfo } from 'cap-systeminfo';
import { Platform } from '@ionic/angular';
import { ApplicationInformationService } from './services/appInfo/application-information.service';
import { ExpertSystem } from './models/expert-system';
import { Http, HttpResponse } from '@capacitor-community/http';

declare let outputs: any; //Map<string, any>;
declare let knowledge: any; // Map<string, any>;
declare function log(category: string, message: string): void;
declare function addKnowledge(tag: string, data: any): void;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private appInfo: ApplicationInformationService) { }

  ngOnInit(): void {
    this.run();
  }

  async run() {
    const tiktokurl = 'https://play.google.com/store/apps/details?id=com.zhiliaoapp.musically&hl=en_US&gl=US';
    const response: HttpResponse = await Http.get({ url: tiktokurl });
    console.log(response);
  }


  // get info

  // run app expert systems

  // map app knowledge

  // put map knowledge into expert systems







  appExpSys() {
    this.appInfo.getInfo().then((data) => {

      console.log(data);
      const apps = data.apps;
      for (const app in apps) {
        const appES = new ExpertSystem();

        const outputDefaults = new Map([['TooManyPermissions', 0]]);
        appES.setOutputDefualts(outputDefaults);



        this.appESRules(appES);

        console.log(appES.Start());
      }

    });
  }

  appESRules(es: ExpertSystem) {


    es.addRule(
      () => {
        if (knowledge.permissionCount >= 10) {
          addKnowledge('tooManyPermissions', true);
        }
      }
    );



  }

}
