import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-map-generator',
  templateUrl: './map-generator.component.html',
  styleUrls: ['./map-generator.component.css']
})
export class MapGeneratorComponent implements OnInit {
  version = environment.appVersion;

  constructor() { }

  ngOnInit() {
  }

}
