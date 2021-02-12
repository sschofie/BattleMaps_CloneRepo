import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-show-map',
  templateUrl: './show-map.component.html',
  styleUrls: ['./show-map.component.css']
})

export class ShowMapComponent implements OnInit {
  mapDisplay = '';
  dwarfText = '';
  selectedScenario = '';
  isLongLoading = false;
  private isLoading: boolean;
  private tmpDwarfText: string;
  private tmpSelectedScenario: string;
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

  async startSpinner() {
    this.isLoading = true;
    await sleep(150);
    this.isLongLoading = this.isLoading;
  }

  onLoad() {
    this.isLoading = false;
    this.isLongLoading = this.isLoading;
    this.selectedScenario = this.tmpSelectedScenario;
    this.dwarfText = this.tmpDwarfText;
  }

  switchMap() {
    this.startSpinner();
    this.tmpSelectedScenario = this.scenarios[Math.floor(Math.random() * this.scenarios.length)];
    const mapNum = 20;
    const chooseIndex =  Math.round(Math.random() * (mapNum-1))+1;
    this.mapDisplay = 'assets/img/maps/ed' +chooseIndex+'.svg';
    this.tmpDwarfText = 'Lars\' Epic Dwarf map #'+chooseIndex;
  }

}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
