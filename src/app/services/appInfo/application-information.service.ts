import { Injectable } from '@angular/core';
import { Http, HttpResponse } from '@capacitor-community/http';
import { Platform } from '@ionic/angular';
import { SystemInfo } from 'cap-systeminfo';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';
import * as testData from './testData.json';
@Injectable({
  providedIn: 'root'
})
export class ApplicationInformationService {

  constructor(private platform: Platform) { }

  async getInfo(): Promise<any> {
    await this.platform.ready();
    if(Capacitor.getPlatform() === 'web'){
      const mockData: any = {...testData};
      delete mockData.default;
      console.log(mockData);
      return mockData;
    }
    const dataString = (await SystemInfo.GetAllInformation()).value;
    const data: any = JSON.parse(dataString);
    data.apps = await Promise.all(data.apps.map(async (app: any): Promise<any> => {
      const tiktokurl = environment.api + '/api/apps/' + app.package;
      const response: HttpResponse = await Http.get({ url: tiktokurl });
      return {...response.data, ...app };
    }));
    return data;
  }

}
