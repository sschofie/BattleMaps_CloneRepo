import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-show-map',
  templateUrl: './show-map.component.html',
  styleUrls: ['./show-map.component.css']
})

export class ShowMapComponent implements OnInit {
  mapDisplay = 'assets/img/Terrain_Pieces_9.svg';

  constructor() { }

  ngOnInit() {
  }

  switchMap() {
    const dwarfImages = Array('Terrain_Pieces_1.svg', 'Terrain_Pieces_2.svg', 'Terrain_Pieces_3.svg',
      'Terrain_Pieces_4.svg', 'Terrain_Pieces_5.svg', 'Terrain_Pieces_6.svg', 'Terrain_Pieces_7.svg',
      'Terrain_Pieces_8.svg', 'Terrain_Pieces_9.svg');
    const chooseIndex =  Math.round(Math.random() * (dwarfImages.length - 1));
    this.mapDisplay = 'assets/img/' + dwarfImages[chooseIndex];
  }

}
