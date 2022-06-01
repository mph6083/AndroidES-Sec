/* eslint-disable guard-for-in */
import { Component, OnInit } from '@angular/core';
import { SystemInfo } from 'cap-systeminfo';
import { Platform } from '@ionic/angular';
import { ApplicationInformationService } from './services/appInfo/application-information.service';
import { ExpertSystem, knowledge, addKnowledge, log, outputs} from './models/expert-system';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private appInfo: ApplicationInformationService) { }

  ngOnInit(): void {

    var es = new ExpertSystem();
    var es


  }



  appExpSys(){
    this.appInfo.getInfo().then( (data) => {

      console.log(data);
      const apps = data.apps;
      for(const app in apps){
        const appES = new ExpertSystem();

        const outputDefaults = new Map([['TooManyPermissions',0]]);
        appES.setOutputDefualts(outputDefaults);



        this.appESRules(appES);

        console.log(appES.Start());
      }

    });
  }

  appESRules(es: ExpertSystem){


    es.addRule(
      () => { if(knowledge.permissionCount >= 10) {
        addKnowledge("tooManyPermissions",true);
      }}
    )



  }

}
