import { Component, OnInit } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { Language } from "../home/language";

@Component({
  selector: 'page-language-popover',
  templateUrl: 'language-popover.html'
})
export class LanguagePopover implements OnInit {
  selected: string;
  languages: Array<Language>;

  constructor(private navParams: NavParams, private viewController: ViewController) {

  }

  ngOnInit(): void {
    if (this.navParams.data) {
      this.languages = this.navParams.data.languages;
      this.selected = this.navParams.data.current;
    }
  }

  onSelected(code: string): void {
    this.viewController.dismiss(code, { animation: 'none' });
  }
}