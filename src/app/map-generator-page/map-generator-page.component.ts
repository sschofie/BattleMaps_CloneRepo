import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-map-generator',
  templateUrl: './map-generator-page.component.html',
  styleUrls: ['./map-generator-page.component.css']
})
export class MapGeneratorPageComponent implements OnInit {
  version = environment.appVersion;
  copyrightYear = environment.copyrightYear;

  constructor() { }

  ngOnInit() {
  }

}
