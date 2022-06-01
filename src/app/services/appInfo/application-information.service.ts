import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SystemInfo } from 'cap-systeminfo';

@Injectable({
  providedIn: 'root'
})
export class ApplicationInformationService {

  constructor(private platform: Platform) { }

  async getInfo(): Promise<any> {
    await this.platform.ready();
    const data = (await SystemInfo.GetAllInformation()).value;
    return JSON.parse(data);
  }
}
