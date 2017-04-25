import { Component, OnInit } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { PopoverController, LoadingController, AlertController, Platform } from 'ionic-angular';
import { LanguagePopover } from "../language-popover/language-popover";
import 'rxjs/add/operator/toPromise';
import { Language } from "./language";
import { TextToSpeech } from "@ionic-native/text-to-speech";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  current: Language;
  languages: Array<Language> = new Array<Language>();
  token: string;
  textToTranslate: string;
  tranlation: string;

  constructor(private http: Http,
    private popoverController: PopoverController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private platfom: Platform,
    private tts: TextToSpeech) {

  }

  ngOnInit(): void {
    (async () => {
      let loading = this.loadingController.create({ content: 'Loading languages...' });
      await loading.present();
      await this.loadLanguages();
      await this.acquireToken();
      await loading.dismiss();
    })();
  }

  popLanguages(ev): void {
    let popover = this.popoverController.create(LanguagePopover, {
      current: this.current.code,
      languages: this.languages
    });

    popover.present({
      ev: ev
    });

    popover.onDidDismiss((selected: string): void => {
      this.current = this.languages.find((language) => language.code === selected);
    });
  }

  private async loadLanguages() {
    let headers = new Headers();
    headers.set('Accept-Language', 'fr');
    let res = await this.http
      .get('https://dev.microsofttranslator.com/languages?api-version=1.0&scope=text', { headers: headers })
      .toPromise();
    let languages = res.json().text;
    for (let code in languages) {
      let language = languages[code];
      this.languages.push({ code: code, name: language.name });
    }

    this.current = this.languages.find((language) => language.code === 'fr');
  }

  private async acquireToken() {
    let headers = new Headers();
    headers.set('Ocp-Apim-Subscription-Key', '778f5a172ecc47d3968b90ea2babb985');
    let res = await this.http
      .post('https://api.cognitive.microsoft.com/sts/v1.0/issueToken', {}, { headers: headers })
      .toPromise();
    this.token = res.text();
  }

  translate(): void {
    (async () => {
      let loading = this.loadingController.create({ content: 'Translate...' });

      await loading.present();
      try {
        await this.loadTranslation();
        await this.platfom.ready();
        await this.tts.speak({ text: this.tranlation, locale: `${this.current.code}-${this.current.code.toUpperCase()}`, rate: 1.5 });
      }
      catch (err) {
        let alert = this.alertController.create({ message: err, title: 'Error' });
        await alert.present();
      }
      await loading.dismiss();
    })();
  }

  private async loadTranslation() {
    let headers = new Headers();
    let bearerToken = `Bearer ${this.token}`;
    headers.append('Authorization', bearerToken);

    let options = new RequestOptions({ headers: headers });

    let res = await this.http
      .get(`https://api.microsofttranslator.com/V2/Http.svc/Translate?from=fr&to=${this.current.code}&text=${this.textToTranslate}`, options)
      .toPromise();
    let parser = new DOMParser();
    let doc = parser.parseFromString(res.text(), "application/xml");
    this.tranlation = doc.documentElement.innerHTML;
  }
}
