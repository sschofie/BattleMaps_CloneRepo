import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-show-map',
  templateUrl: './show-map.component.html',
  styleUrls: ['./show-map.component.css']
})

export class ShowMapComponent implements OnInit {
  mapDisplay = '';
  selectedScenario: string;
  private scenarios = [
    `Control`,
    `Dominate`,
    `Fool's Gold`,
    `Invade`,
    `Kill`,
    `Loot`,
    `Pillage`,
    `Plunder`,
    `Push`,
    `Salt the Earth`,
    `Smoke & Mirrors`
  ];

  constructor() { }

  ngOnInit() {
    this.switchMap();
  }

  switchMap() {
    this.selectedScenario = this.scenarios[Math.floor(Math.random() * this.scenarios.length)];
    const mapNum = 20;
    const chooseIndex = Math.round(Math.random() * (mapNum - 1)) + 1;
    this.mapDisplay = 'assets/img/maps/ed' + chooseIndex + '.svg';
  }

}
