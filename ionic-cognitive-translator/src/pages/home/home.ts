import { Component, OnInit } from '@angular/core';
import { LoadingController, Platform, ToastController } from 'ionic-angular';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { Language } from './language';
import { TranslatorService } from "./translator.service";
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  from: string;
  to: string;
  languages: Array<Language> = new Array<Language>();
  text: string;
  isTalking: boolean = false;
  token: string;

  constructor(
    private translatorService: TranslatorService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private platfom: Platform,
    private tts: TextToSpeech,
    private speechRecognition: SpeechRecognition) {
  }

  ngOnInit(): void {
    (async () => {
      let loading = this.loadingController.create({ content: 'Loading languages...' });
      await loading.present();

      this.translatorService
        .getLanguages()
        .subscribe(languages => this.languages = languages, err => this.pushError(err));
      this.translatorService
        .getToken()
        .subscribe(token => this.token = token, err => this.pushError(err));

      await loading.dismiss();
    })();
  }

  async speech(): Promise<void> {
    this.isTalking = !this.isTalking;

    let hasPermission = await this.hasSpeedchPermission();

    if (!hasPermission) {
      await this.getSpeechPermission();
    }


    this.speechRecognition.startListening().subscribe((data) => {
      data.forEach(item => {
        this.text = this.text + item;
      });
    }, err => this.pushError(err));
  }

  translate(): void {
    this.isTalking = !this.isTalking;
    (async () => {
      await this.speechRecognition.stopListening();
      let loading = this.loadingController.create({ content: 'Translate...' });

      await loading.present();
      await this.platfom.ready();

      let from = this.languages.find(language => language.code === this.from);
      let to = this.languages.find(language => language.code === this.to);
      this.translatorService
        .getTranslation(this.token, from, to, this.text)
        .subscribe((translation) => {
          this.tts
            .speak({ text: translation, locale: `${to.code}-${to.code.toUpperCase()}`, rate: 1.5 })
            .then(() => loading.dismiss());
        }, err => this.pushError(err));
    })();
  }

  async getSpeechPermission(): Promise<void> {
    try {
      let permission = await this.speechRecognition.requestPermission();
      console.log(permission);
      return permission;
    }
    catch (e) {
      console.error(e);
    }
  }

  async hasSpeedchPermission(): Promise<boolean> {
    try {
      let permission = await this.speechRecognition.hasPermission();
      return permission;
    }
    catch (e) {
      console.error(e);
    }
  }

  pushError(err: any) {
    let toast = this.toastController.create({ message: err, duration: 5000 });
    toast.present();
  }
}
