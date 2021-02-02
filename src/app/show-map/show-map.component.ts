import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-show-map',
  templateUrl: './show-map.component.html',
  styleUrls: ['./show-map.component.css']
})

export class ShowMapComponent implements OnInit {
  mapDisplay = '';

  constructor() { }

  ngOnInit() {
    this.switchMap();
  }

  switchMap() {
    const mapNum = 20;
    const chooseIndex =  Math.round(Math.random() * (mapNum-1))+1;
    this.mapDisplay = 'assets/img/maps/ed' +chooseIndex+'.svg';
  }

}
