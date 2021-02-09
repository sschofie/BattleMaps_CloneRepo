import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: [
    './landing-page.component.css',
    './vendor/simple-line-icons/css/simple-line-icons.css'
  ]
})

export class LandingPageComponent implements OnInit {
  version = environment.appVersion;
  copyrightYear = environment.copyrightYear;

  constructor() { }

  ngOnInit() {
  }

}
