import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { ShowMapComponent } from '../show-map.component';
import { Node, TerrainPiece } from '../../dynamic-map/dynamic-map';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';



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
        this.getsvgName(n.item.svg),
        n.height,
        n.radius,
        TerrainPiece.Type[n.item.type]
      ));
    }
    return legendNodes;
  }

  /**
   * this function takes the svg name and maps to a concise name to print
   */
  getsvgName(svg: string){
    const svgMap = new Map([
      ['boulder', 'Mountain'],
      ['boulder2', 'Rock Hill'],
      ['boulder3', 'Grass Hill'],
      ['crop_field', 'Field'],
      ['foliage', 'Forest'],
      ['hedge_wall', 'Hedge'],
      ['hedge_wall2', 'Hedge'],
      ['house', 'Building'],
      ['pond', 'Pond'],
      ['stone_wall', 'Stone Wall'],
      ['tree', 'Tree'],
      ['wood_building', 'Building'],
      ['wood_wall_1', 'Wood Wall']
    ]);
    for(const entry of svgMap.entries()){
        if ( svg === entry[0]){
        return entry[1];
      }
    }
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
      const textWidth = lCtx.measureText(heightText).width;
      lCtx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      if ( p.item === 'Forest' || p.item === 'Tree'){
        lCtx.fillRect((p.x - 25), (p.y - 17), textWidth + 5, 30);
        lCtx.font = 'IM Fell DW Pica';
        lCtx.fillStyle = 'black';
        lCtx.fillText(typeText, (p.x - 22), (p.y - 5));
        lCtx.fillText(heightText, (p.x - 22), (p.y + 7));
      }else if ( p.item === 'Rock Hill' || p.item === 'Grass Hill'){
        lCtx.fillRect((p.x - 25), (p.y - 17), textWidth + 10, 30);
        lCtx.font = 'IM Fell DW Pica';
        lCtx.fillStyle = 'black';
        lCtx.fillText(itemText, (p.x - 22), (p.y - 5));
        lCtx.fillText(heightText, (p.x - 22), (p.y + 7));
      }else if ( p.item === 'Stone Wall' || p.item === 'Wood Wall'){
        lCtx.fillRect((p.x - 25), (p.y - 27), textWidth + 15, 40);
        lCtx.font = 'IM Fell DW Pica';
        lCtx.fillStyle = 'black';
        lCtx.fillText(typeText, (p.x - 22), (p.y - 16));
        lCtx.fillText(itemText, (p.x - 22), (p.y - 5));
        lCtx.fillText(heightText, (p.x - 22), (p.y + 7));
      }else{
        lCtx.fillRect((p.x - 25), (p.y - 27), textWidth + 5, 40);
        lCtx.font = 'IM Fell DW Pica';
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


