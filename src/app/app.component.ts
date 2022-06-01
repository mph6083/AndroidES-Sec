/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable guard-for-in */
import { Component, OnInit } from '@angular/core';
import { SystemInfo } from 'cap-systeminfo';
import { Platform } from '@ionic/angular';
import { ApplicationInformationService } from './services/appInfo/application-information.service';
import { ExpertSystem } from './models/expert-system';

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

    const es = new ExpertSystem();
    const outputDefaults = new Map([['finalNumber', 0]]);
    es.setOutputDefualts(outputDefaults);
    es.addKnowledge('a', 4);
    es.addKnowledge('b', 12);
    es.addRule(() => { if (knowledge.get('b') && knowledge.get('c')) { outputs.set('finalNumber', 4); } });
    es.addRule(() => {
      const x = knowledge.get('a');
      if (x === 4) {
        addKnowledge('c', 12);
      }
    });
    es.Start();
    console.log(es.knowledge);
    console.log(es.outputs);

  }



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
          addKnowledge("tooManyPermissions", true);
        }
      }
    );



  }

}
