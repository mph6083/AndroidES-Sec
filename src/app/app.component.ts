/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/dot-notation */
/* eslint-disable guard-for-in */
import { Component, OnInit } from '@angular/core';
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

  app_count = 0;
  medium_risk_count = 0;
  high_risk_count = 0;
  security_score = 0;
  appLogs: Map<string, any>;
  output: any;
  ngOnInit(): void {
    this.run();
  }

  async run() {
    const info = await this.appInfo.getInfo();
    this.runAppRisk(info);

    this.runGeneral(info);
    console.log(this.output);
  }

  /** run the general ES
   *
   * @param info device info
   */
  runGeneral(info: any) {
    const GeneralES = new ExpertSystem();
    this.obtainGeneralKnowledge(info, GeneralES);
    this.addRuleGeneral(GeneralES);
    GeneralES.Start();
    console.log(GeneralES.knowledge);
    this.output = { ...this.output,
      generalScore: (Math.round(((GeneralES.knowledge.get('DEVICE_SCORE')) + Number.EPSILON) * 100) / 100.0),
      generalLogs: GeneralES.logs,
      appLogs: this.appLogs,
      appAverageScore: ( Math.round((((this.security_score / (0.0 + this.app_count))) + Number.EPSILON) * 100) / 100.0)
    };
  }

  /**
   * obtain knowledge for the general ES
   *
   * @param info device info
   * @param es Expert system object
   */
  obtainGeneralKnowledge(info: any, es: ExpertSystem) {
    console.log(info);
    es.addKnowledge('APP_COUNT', this.app_count);
    es.addKnowledge('MED_RISK_COUNT', this.medium_risk_count);
    es.addKnowledge('HIGH_RISK_COUNT', this.high_risk_count);
    es.addKnowledge('APP_AVG_SCORE', this.security_score / (0.0 + this.app_count));
    es.addKnowledge('BRAND', info.brand);
    es.addKnowledge('ANDROID_OS_VERSION', info.release);
  }

  /**
   * add rules for general device security to the expert system
   *
   * @param es expert system
   */
  addRuleGeneral(es: any) {
    es.addRule('lots of apps', () => {
      if (knowledge.get('APP_COUNT') > 40 && knowledge.get('APP_COUNT') <= 60) {
        addKnowledge('LOTS_OF_APPS', true);
        log('device', 'More Apps than the average User: ' + knowledge.get('APP_COUNT'));
      }
    });
    es.addRule('too many apps', () => {
      if (knowledge.get('APP_COUNT') > 60 && knowledge.get('APP_COUNT') <= 100) {
        addKnowledge('TOO_MANY_APPS', true);
        log('device', 'Large number of apps on device: ' + knowledge.get('APP_COUNT'));
      }
    });
    es.addRule('too many apps', () => {
      if (knowledge.get('APP_COUNT') > 100) {
        addKnowledge('WAY_TOO_MANY_APPS', true);
        log('device', 'Extremly large number of apps on device: ' + knowledge.get('APP_COUNT'));
      }
    });

    es.addRule('too many high risk apps', () => {
      if (knowledge.get('HIGH_RISK_COUNT') > 7) {
        addKnowledge('TOO_MANY_HIGH_RISK_APPS', true);
        log('device', 'Too many high risk apps');
      }
    });

    es.addRule('too many med risk apps', () => {
      if (knowledge.get('MED_RISK_COUNT') > 30) {
        addKnowledge('TOO_MANY_MED_RISK_APPS', true);
        log('device', 'too many medium risk apps');
      }
    });

    es.addRule('chineese manufacturers', () => {
      if (['Huawei', 'Xiaomi'].includes(knowledge.get('BRAND') ?? '')) {
        addKnowledge('UNSAFE_MANUFACTURER', true);
        log('device', 'unsafe manufacurer: ' + knowledge.get('BRAND'));
      }
    });

    es.addRule('version under 12', () => {
      if (knowledge.get('ANDROID_OS_VERSION')) {
        addKnowledge('VERSION_RISK', Math.max(0, 13 - knowledge.get('ANDROID_OS_VERSION')) / 4);
      }
    });
    es.addRule('compute app score subtraction', () => {
      if (knowledge.get('APP_AVG_SCORE')) {
        const app_risk = (10 - Math.floor(knowledge.get('APP_AVG_SCORE'))) / 4;
        addKnowledge('APP_RISK', app_risk);
      }
    });

    es.addRule('compute device security', () => {
      let dev_sec = 10.0;
      dev_sec -= knowledge.get('VERSION_RISK') ? 1.0 : 0;
      dev_sec -= knowledge.get('UNSAFE_MANUFACTURER') ? 1.0 : 0;
      dev_sec -= (knowledge.get('TOO_MANY_MED_RISK_APPS') ? 0.5 : 0);
      dev_sec -= (knowledge.get('TOO_MANY_HIGH_RISK_APPS') ? 0.5 : 0);
      dev_sec -= knowledge.get('WAY_TOO_MANY_APPS') ? 1.0 : 0;
      dev_sec -= knowledge.get('TOO_MANY_APPS') ? 0.5 : 0;
      dev_sec -= knowledge.get('LOTS_OF_APPS') ? 0.3 : 0;
      dev_sec -= (10 - Math.floor(knowledge.get('APP_AVG_SCORE') ?? 5)) / 4;

      addKnowledge('DEVICE_SCORE', dev_sec);
    });

  }

  /** run the APP evaluation ES
   *
   * @param info generated info
   */
  runAppRisk(info: any) {

    const apps: any[] = info.apps;
    this.appLogs = new Map<string, any>();
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      const appES = new ExpertSystem();

      if (app.title === undefined) {
      }
      else {
        this.obtainKnowledge(app, appES);
        this.addRules(appES);
        appES.Start();
        let score = appES.knowledge.get('APP_SCORE');
        score = (score === undefined) ? 0 : score;
        const roundedScore = Math.round((score + Number.EPSILON) * 100) / 100.0;
        this.appLogs.set(app.title, { logs: appES.logs, score: roundedScore });
        this.app_count++;
        this.security_score += score;
        if (score < 5) {
          this.high_risk_count++;
        }
        else if (score < 7) {
          this.medium_risk_count++;
        }
      }
    }
  }

  /** obtain knowledge for the app expert system
   *
   */
  obtainKnowledge(app: any, es: ExpertSystem) {
    es.addKnowledge('HAS_ADS', app.adSupported);
    es.addKnowledge('NAME', app.title);
    es.addKnowledge('IS_AVALABLE', app.available);
    es.addKnowledge('IS_FREE', app.free);
    es.addKnowledge('INSTALLS', app.minInstalls);
    es.addKnowledge('RATING_COUNT', app.ratings);
    es.addKnowledge('RELEASE_DATE', app.released);
    es.addKnowledge('RATING_SCORE', app.score);

    const date = new Date(app.updated);
    const updatedDate = date.toLocaleString('en-us', { month: 'short' }) + ' ' + date.getDate() + ', ' + date.getFullYear();

    es.addKnowledge('LAST_UPDATED', updatedDate);

    let websiteDomain = app.developerWebsite?.split('//')[1]?.split('/')[0];
    if (websiteDomain?.startsWith('www.')) { websiteDomain = websiteDomain.split('www.')[1]; }
    es.addKnowledge('PRIVACY_MATCH_WEBSITE', app.privacyPolicy?.includes(websiteDomain) ?? false);
    es.addKnowledge('EMAIL_MATCH_WEBSITE', app.developerEmail?.split('@')[1] === websiteDomain);
    es.addKnowledge('EMAIL_IS_COMMON', false);
    // is common email
    ['gmail.com',
      'yahoo.com',
      'outlook.com',
      'outlook.net',
      'aol.com',
      'me.com',
      'icloud.com',
      'hotmail.com',
      'hotmail.co.uk',
      'hotmail.fr',
      'msn.com',
      'yahoo.fr',
      'mac.com'
    ].forEach((email) => {
      if (app.developerEmail?.includes(email)) {
        es.addKnowledge('EMAIL_IS_COMMON', true);
      }
    });

    es.addKnowledge('PERMISSON_COUNT', app.permissions.length);
    for (let j = 0; j < app.permissions.length; j++) {
      if (app.permissions[j].startsWith('android.permission.')) {
        es.addKnowledge(app.permissions[j].split('android.permission.')[1], true);
      }
    }

  }

  /**
   * add the rules for the app evaluation expert system.
   */
  addRules(es: ExpertSystem) {
    // if app has been updated update frequency score = 10
    es.addRule('see if app has been updated', () => {
      if (knowledge.get('RELEASE_DATE')?.length > 0 && knowledge.get('RELEASE_DATE') !== knowledge.get('LAST_UPDATED')) {
        addKnowledge('HAS_BEEN_UPDATED', true);
      }
      else {
        log('activity', 'app has never been updated');
      }
    });

    es.addRule('updated in the past month', () => {
      const date = new Date();
      const updatedDate = date.toLocaleString('en-us', { month: 'short' }) + date.getFullYear();
      let monthYear: any = knowledge.get('LAST_UPDATED').split(' ');
      monthYear = monthYear[0] + monthYear[2];

      if (knowledge.get('HAS_BEEN_UPDATED') && updatedDate === monthYear) {
        addKnowledge('RECIENTLY_UPDATED', true);
      }
    });

    es.addRule('updated in the past year', () => {
      const date = new Date();
      const updatedDate = '' + date.getFullYear();
      let monthYear: any = knowledge.get('LAST_UPDATED').split(' ');
      monthYear = monthYear[2];
      if (knowledge.get('HAS_BEEN_UPDATED') && updatedDate === monthYear) {
        addKnowledge('UPDATED_PAST_YEAR', true);
      }
    });

    es.addRule('ever been updated', () => {
      if (!knowledge.get('HAS_BEEN_UPDATED')) {
        addKnowledge('NO_UPDATES', true);
      }
    });

    es.addRule('not avalible and never been updated', () => {
      if (knowledge.get('IS_AVALABLE') === false && !knowledge.get('HAS_BEEN_UPDATED')) {
        addKnowledge('ACTIVE_SCORE', 0);
        log('active', 'app not avalible and never been updated');
      }
    });
    es.addRule('avalible and never been updated', () => {
      if (knowledge.get('IS_AVALABLE') && !knowledge.get('HAS_BEEN_UPDATED')) {
        addKnowledge('ACTIVE_SCORE', 2);
        log('active', 'app has not been updated');
      }
    });

    es.addRule('app is avalible and updated in the past month', () => {
      if (knowledge.get('IS_AVALABLE') && knowledge.get('RECIENTLY_UPDATED')) {
        addKnowledge('ACTIVE_SCORE', 10);
      }
    });

    es.addRule('avalible and updated this year but not within a month', () => {
      if (knowledge.get('IS_AVALABLE') && !knowledge.get('RECIENTLY_UPDATED') && knowledge.get('UPDATED_PAST_YEAR') && knowledge.get('HAS_BEEN_UPDATED')) {
        addKnowledge('ACTIVE_SCORE', 6);
      }
    });

    es.addRule('avalible and updated but not in the past year', () => {
      if (!knowledge.get('RECIENTLY_UPDATED') && knowledge.get('HAS_BEEN_UPDATED') && !knowledge.get('UPDATED_PAST_YEAR')) {
        addKnowledge('ACTIVE_SCORE', 4);
        log('active', 'app not updated in the past year');
      }
    });

    es.addRule('', () => {
      if (knowledge.get('EMAIL_MATCH_WEBSITE') === true && !(knowledge.get('EMAIL_IS_COMMON') === true) && knowledge.get('PRIVACY_MATCH_WEBSITE') === true) {
        addKnowledge('DEVELOPER_TRUST', 10);
      }
    });
    es.addRule('common email and privacy matches dev email', () => {
      if (knowledge.get('EMAIL_IS_COMMON') && knowledge.get('PRIVACY_MATCH_WEBSITE')) {
        addKnowledge('DEVELOPER_TRUST', 7);
      }
    });

    es.addRule('Rating number degree of trust', () => {
      addKnowledge('RATING_COUNT_MODIFIER', 0);
      if (knowledge.get('RATING_COUNT') < 50) {
        addKnowledge('RATING_COUNT_MODIFIER', 0);
        log('rating', 'app does not have lots of ratings');
      }
    });
    es.addRule('Rating number degree of trust', () => {
      if (knowledge.get('RATING_COUNT') >= 1000) {
        addKnowledge('RATING_COUNT_MODIFIER', 2);
      }
    });
    es.addRule('Rating number degree of trust', () => {
      if (knowledge.get('RATING_COUNT') >= 10000) {
        addKnowledge('RATING_COUNT_MODIFIER', 3);
      }
    });
    es.addRule('Rating number degree of trust', () => {
      if (knowledge.get('RATING_COUNT') >= 100000) {
        addKnowledge('RATING_COUNT_MODIFIER', 5);
      }
    });
    es.addRule('Rating number degree of trust', () => {
      if (knowledge.get('RATING_COUNT') >= 1000000) {
        addKnowledge('RATING_COUNT_MODIFIER', 7);
      }
    });
    es.addRule('Rating number degree of trust', () => {
      if (knowledge.get('RATING_COUNT') >= 10000000) {
        addKnowledge('RATING_COUNT_MODIFIER', 10);
      }
    });

    es.addRule('', () => {
      if (knowledge.get('RATING_COUNT_MODIFIER') !== undefined && knowledge.get('RATING_SCORE') !== undefined) {
        addKnowledge('RATING_TRUST', Math.min(knowledge.get('RATING_SCORE') * 2 + knowledge.get('RATING_COUNT_MODIFIER'), 10));
      }
    });

    es.addRule('too many permissions', () => {
      if (knowledge.get('PERMISSON_COUNT') > 30) {
        addKnowledge('TOO_MANY_PERMISSIONS', true);
        log('permissions', 'app requests lots of permissions');
      }
      else {
        addKnowledge('TOO_MANY_PERMISSIONS', false);
      }
    });

    es.addRule('location danger', () => {
      if (knowledge.get('INTERNET') && knowledge.get('ACCESS_FINE_LOCATION')) {
        addKnowledge('LOCATION_DANGER', true);
        log('permissions', 'location data at risk');
      }
    });

    es.addRule('network danger', () => {
      if (knowledge.get('INTERNET') && (knowledge.get('ACCESS_NETWORK_STATE') || knowledge.get('ACCESS_WIFI_STATE'))) {
        addKnowledge('NETWORK_DANGER', true);
        log('permissions', 'network surroundings at risk');
      }
    });

    es.addRule('data mining risk', () => {
      if (knowledge.get('INTERNET') && (knowledge.get('READ_CONTACTS') || knowledge.get('READ_CALENDAR'))) {
        addKnowledge('DATA_DANGER', true);
        log('permissions', 'personal data at risk');
      }
    });

    es.addRule('permissions risk ', () => {
      let permissionErrorCount = 0;
      permissionErrorCount += knowledge.get('DATA_DANGER') === true ? 1 : 0;
      permissionErrorCount += knowledge.get('NETWORK_DANGER') === true ? 1 : 0;
      permissionErrorCount += knowledge.get('LOCATION_DANGER') === true ? 1 : 0;
      permissionErrorCount += knowledge.get('TOO_MANY_PERMISSIONS') === true ? 1 : 0;
      if (true) {
        addKnowledge('PERMISSION_ERRORS', permissionErrorCount);
      }
    });
    es.addRule('install number degree of trust', () => {
      if (knowledge.get('INSTALLS') < 50) {
        addKnowledge('INSTALL_TRUST_MODIFIER', 1);
        log('installs', 'Very Low install count');
      }
    });
    es.addRule('install number degree of trust', () => {
      if (knowledge.get('INSTALLS') >= 1000 && knowledge.get('INSTALLS') < 10000) {
        addKnowledge('INSTALL_TRUST_MODIFIER', .99);
        log('installs','low install count');
      }
    });
    es.addRule('install number degree of trust', () => {
      if (knowledge.get('INSTALLS') >= 10000 && knowledge.get('INSTALLS') < 100000) {
        addKnowledge('INSTALL_TRUST_MODIFIER', .87);
      }
    });
    es.addRule('install number degree of trust', () => {
      if (knowledge.get('INSTALLS') >= 100000 && knowledge.get('INSTALLS') < 1000000) {
        addKnowledge('INSTALL_TRUST_MODIFIER', .97);
      }
    });
    es.addRule('install number degree of trust', () => {
      if (knowledge.get('INSTALLS') >= 1000000 && knowledge.get('INSTALLS') < 10000000) {
        addKnowledge('INSTALL_TRUST_MODIFIER', .60);
      }
    });
    es.addRule('install number degree of trust', () => {
      if (knowledge.get('INSTALLS') >= 10000000 && knowledge.get('INSTALLS') < 50000000) {
        addKnowledge('INSTALL_TRUST_MODIFIER', .4);
      }
    });
    es.addRule('install number degree of trust', () => {
      if (knowledge.get('INSTALLS') >= 50000000) {
        addKnowledge('INSTALL_TRUST_MODIFIER', .2);
      }
    });
    es.addRule('permission trust', () => {
      if (knowledge.get('INSTALL_TRUST_MODIFIER') !== undefined && knowledge.get('PERMISSION_ERRORS') !== undefined) {
        addKnowledge('PERMISSION_TRUST', Math.floor(10 - (knowledge.get('PERMISSION_ERRORS') * knowledge.get('INSTALL_TRUST_MODIFIER'))));
      }
    });

    es.addRule('App Trust', () => {
      let total = 0.0;
      const count = 4.0;
      if (knowledge.get('PERMISSION_TRUST')) {
        total += knowledge.get('PERMISSION_TRUST');
      }
      if (knowledge.get('RATING_TRUST')) {
        total += knowledge.get('RATING_TRUST');
      }
      if (knowledge.get('DEVELOPER_TRUST')) {
        total += knowledge.get('DEVELOPER_TRUST');
      }
      else {
        log('Developer Trust', 'Developer not trusted');
      }
      if (knowledge.get('ACTIVE_SCORE')) {
        total += knowledge.get('ACTIVE_SCORE');
      }

      const appScore = total / (0.0 + count);
      addKnowledge('APP_SCORE', appScore);

    });

  }


}
