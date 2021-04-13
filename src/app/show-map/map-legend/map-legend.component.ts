import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { ShowMapComponent } from '../show-map.component';
import { Node, TerrainPiece } from '../../dynamic-map/dynamic-map';



@Component({
  selector: 'app-map-legend',
  templateUrl: './map-legend.component.html',
  styleUrls: ['./map-legend.component.css']
})
export class MapLegendComponent implements OnInit {
  @Input() mapNodes: Node[];
  @Input() showLegend: boolean;
  @Input() passNodes: () => void;
  @Output() getlegendNodes = new EventEmitter<void>();
  legend: Legend[];
  myMapNodes: Node[];
  printLegend;

  constructor(
    private showmapComponent: ShowMapComponent
  ) { }

  ngOnInit() {
    this.myMapNodes = this.showmapComponent.passNodes();
    this.legend = this.getNodes();
    this.printLegend = this.printMapLegend(this.legend, 400, 600);
  }

  emitmapNodes() {
    this.getlegendNodes.emit(this.printLegend);
  }

  /**
   * this function takes the array of mapNodes
   * and makes an array of Legend to print to canvas
   */
  getNodes() {
    if (!this.myMapNodes) {
      return null;
    }
    const legendNodes: Legend[] = [];
    for (const n of this.myMapNodes) {
      legendNodes.push(new Legend(
        n.x,
        n.y,
        n.item.svg,
        n.height,
        n.radius,
        TerrainPiece.Type[n.item.type]
      ));
    }
    return legendNodes;
  }

  /**
   * this function takes the array of 'legends' and prints them to the canvas.
   *
   * @param encoding - this array of legends taken from the map Nodes
   * @param h - indicates the height of the map to be printed
   * @param w - indicated the width of the map to be printed
   */
  printMapLegend(encoding: Legend[], h: number, w: number) {
    const lCanvas = document.getElementById('legendViewer') as HTMLCanvasElement;
    const lCtx = lCanvas.getContext('2d') as CanvasRenderingContext2D;
    lCtx.clearRect(0, 0, lCtx.canvas.width, lCtx.canvas.height);
    const width = this.showmapComponent.showWidth.nativeElement.offsetWidth;
    lCtx.canvas.width = width;
    lCtx.canvas.height = width * .66;
    lCtx.scale(width / w, width * .66 / h);

    //code to draw items
    for (const p of encoding) {
      const typeText = p.type;
      const itemText = p.item;
      const heightText = 'Height: ' + p.height;
      const textWidth = lCtx.measureText(itemText).width;
      lCtx.fillStyle = 'white';
      if (itemText === 'tree') {
        lCtx.fillRect((p.x - 25), (p.y - 27), textWidth + 30, 40);
        lCtx.fillStyle = 'black';
        lCtx.fillText(typeText, (p.x - 22), (p.y - 16));
        lCtx.fillText(itemText, (p.x - 22), (p.y - 5));
        lCtx.fillText(heightText, (p.x - 22), (p.y + 7));
      } else if (itemText === 'pond') {
        lCtx.fillRect((p.x - 25), (p.y - 27), textWidth + 25, 40);
        lCtx.fillStyle = 'black';
        lCtx.fillText(typeText, (p.x - 22), (p.y - 16));
        lCtx.fillText(itemText, (p.x - 22), (p.y - 5));
        lCtx.fillText(heightText, (p.x - 22), (p.y + 7));
      } else if (itemText === 'house') {
        lCtx.fillRect((p.x - 25), (p.y - 25), textWidth + 20, 40);
        lCtx.fillStyle = 'black';
        lCtx.fillText(typeText, (p.x - 22), (p.y - 16));
        lCtx.fillText(itemText, (p.x - 22), (p.y - 5));
        lCtx.fillText(heightText, (p.x - 22), (p.y + 7));
      } else if (itemText === 'wood_building') {
        lCtx.fillRect((p.x - 31), (p.y - 25), textWidth + 2, 40);
        lCtx.fillStyle = 'black';
        lCtx.fillText(typeText, (p.x - 30), (p.y - 12));
        lCtx.fillText(itemText, (p.x - 30), (p.y - 2));
        lCtx.fillText(heightText, (p.x - 30), (p.y + 9));
      } else if (itemText === 'stone_wall') {
        lCtx.fillRect((p.x - 31), (p.y - 25), textWidth + 2, 40);
        lCtx.fillStyle = 'black';
        lCtx.fillText(typeText, (p.x - 30), (p.y - 12));
        lCtx.fillText(itemText, (p.x - 30), (p.y - 2));
        lCtx.fillText(heightText, (p.x - 30), (p.y + 9));
      } else if (itemText === 'hedge_wall') {
        lCtx.fillRect((p.x - 31), (p.y - 25), textWidth + 2, 40);
        lCtx.fillStyle = 'black';
        lCtx.fillText(typeText, (p.x - 30), (p.y - 12));
        lCtx.fillText(itemText, (p.x - 30), (p.y - 2));
        lCtx.fillText(heightText, (p.x - 30), (p.y + 9));
      } else if (itemText === 'hedge_wall2') {
        lCtx.fillRect((p.x - 31), (p.y - 25), textWidth + 2, 40);
        lCtx.fillStyle = 'black';
        lCtx.fillText(typeText, (p.x - 30), (p.y - 12));
        lCtx.fillText(itemText, (p.x - 30), (p.y - 2));
        lCtx.fillText(heightText, (p.x - 30), (p.y + 9));
      } else {
        lCtx.fillRect((p.x - 25), (p.y - 27), textWidth + 15, 40);
        lCtx.fillStyle = 'black';
        lCtx.fillText(typeText, (p.x - 22), (p.y - 16));
        lCtx.fillText(itemText, (p.x - 22), (p.y - 5));
        lCtx.fillText(heightText, (p.x - 22), (p.y + 7));
      }
    }
  }

}


export class Legend {
  public x: number;
  public y: number;
  public item: string;
  public height: number;
  public radius: number;
  public type: string;

  public constructor(x, y, item, height, radius, type) {
    this.x = x;
    this.y = y;
    this.item = item;
    this.height = height;
    this.radius = radius;
    this.type = type;
  }
}


