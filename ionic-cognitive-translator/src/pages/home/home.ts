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
  from: Language;
  to: Language;
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
      this.translatorService.getLanguages().subscribe(languages => this.languages = languages);
      this.translatorService.getToken().subscribe(token => this.token = token);
      await loading.dismiss();
    })();
  }

  speech(): void {
    this.isTalking = !this.isTalking;
    /*this.speech.startListening().subscribe((data) => {
      data.forEach(item => {
        this.textToTranslate = this.textToTranslate + item;
      });
    }, (err) => {
      this.textToTranslate = err;
    });*/
  }

  translate(): void {
    this.isTalking = !this.isTalking;
    /**/
    /*(async () => {
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
    })();*/
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
}
