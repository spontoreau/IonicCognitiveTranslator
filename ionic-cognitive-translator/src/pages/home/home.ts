import { Component, OnInit } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { PopoverController, LoadingController } from 'ionic-angular';
import { LanguagePopover } from "../language-popover/language-popover";
import 'rxjs/add/operator/toPromise';
import { Language } from "./language";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  current: Language;
  languages: Array<Language> = new Array<Language>();
  token: string;

  constructor(private http: Http, private popoverController: PopoverController, private loadingController: LoadingController) {

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

  async loadLanguages() {
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

  async acquireToken() {
    let headers = new Headers();
    headers.set('Ocp-Apim-Subscription-Key', '');
    let res = await this.http
      .post('https://api.cognitive.microsoft.com/sts/v1.0/issueToken', {}, { headers: headers })
      .toPromise();
    this.token = res.text();
    console.log(this.token);
  }
}
