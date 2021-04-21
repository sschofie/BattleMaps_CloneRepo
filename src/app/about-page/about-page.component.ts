import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-about-page',
  templateUrl: './about-page.component.html',
  styleUrls: [
    './about-page.component.css',
    '../../assets/simple-line-icons/css/simple-line-icons.css'
  ]
})

export class AboutPageComponent implements OnInit {
  version = environment.appVersion;
  copyrightYear = environment.copyrightYear;

  constructor() { }

  ngOnInit() {
  }

}
