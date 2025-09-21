import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Device } from '@capacitor/device';

@Injectable({
  providedIn: 'root'
})
export class Translate {

  private languages = ['en', 'es'];

  constructor(
    private translate: TranslateService,
  ) {
    this.initLanguage();
  }
  
  async initLanguage() {
    const lastLang = localStorage.getItem('app-language');
    if(lastLang && this.languages.includes(lastLang)) {
      this.useLang(lastLang);
      return;
    }

    const info = await Device.getLanguageCode();
    const deviceLang = info.value.split('-')[0];
    if(deviceLang && this.languages.includes(deviceLang)) {
      this.useLang(deviceLang);
      return;
    }

    const browserLang = this.translate.getBrowserLang();
    if(browserLang && this.languages.includes(browserLang)) {
      this.useLang(browserLang)
    } else {
      this.useLang('en');
    }
  }

  useLang(lang: string) {
    if(!this.languages.includes(lang)) {
      lang = 'en';
    }

    this.translate.use(lang);
    localStorage.setItem('app-language', lang);

  }

  instant(key: string, params?: any) {
    return this.translate.instant(key, params);
  }

  getCurrentLang() {
    return this.translate.currentLang || this.translate.getDefaultLang();
  }

}