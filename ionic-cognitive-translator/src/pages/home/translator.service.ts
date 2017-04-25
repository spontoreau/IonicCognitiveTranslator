import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from "@angular/http";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';
import { Language } from "./language";

@Injectable()
export class TranslatorService {

    constructor(private http: Http) { }

    getToken(): Observable<string> {
        let headers = new Headers();
        headers.set('Ocp-Apim-Subscription-Key', '778f5a172ecc47d3968b90ea2babb985');
        return this.http
            .post('https://api.cognitive.microsoft.com/sts/v1.0/issueToken', {}, { headers: headers })
            .map((rep) => rep.text());
    }

    getLanguages(): Observable<Array<Language>> {
        let headers = new Headers();
        headers.set('Accept-Language', 'en');
        return this.http
            .get('https://dev.microsofttranslator.com/languages?api-version=1.0&scope=text', { headers: headers })
            .map(res => res.json().text)
            .map(languages => this.parse(languages));
    }

    getTranslation(token: string, from: Language, to: Language, text: string): Observable<string> {
        let headers = new Headers();
        let bearerToken = `Bearer ${token}`;
        headers.append('Authorization', bearerToken);

        let options = new RequestOptions({ headers: headers });

        return this.http
            .get(`https://api.microsofttranslator.com/V2/Http.svc/Translate?from=${from.code}&to=${to.code}&text=${text}`, options)
            .map(res => this.parseTranslationFromXml(res.text()));
    }

    private parse(languages: any): Array<Language> {
        let array = new Array<Language>();
        for (let code in languages) {
            let language = languages[code];
            array.push({ code: code, name: language.name });
        }

        return array.sort((language1: Language, language2: Language) => {
            if (language1.name > language2.name)
                return 1;
            else if (language1.name < language2.name)
                return -1;
            return 0;
        });
    }

    private parseTranslationFromXml(xml: string): string {
        let parser = new DOMParser();
        let doc = parser.parseFromString(xml, 'application/xml');
        return doc.documentElement.innerHTML;
    }
}