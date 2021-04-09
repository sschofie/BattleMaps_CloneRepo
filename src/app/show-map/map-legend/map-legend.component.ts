import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { ShowMapComponent } from '../show-map.component';


@Component({
  selector: 'app-map-legend',
  templateUrl: './map-legend.component.html',
  styleUrls: ['./map-legend.component.css']
})
export class MapLegendComponent implements OnInit {
  @Input() mapNodes: Node[];
  @Input() showLegend: boolean;
  @Input() passNodes: Function;
  @Output() getLegendNodes = new EventEmitter<void>();
  legend: Legend[];
  private itemsToLoad: number;
  private itemsLoaded: number;
  myMapNodes;
  printLegend;

  constructor(
    private showmapComponent: ShowMapComponent
  ) { }

  ngOnInit() {
    this.myMapNodes = this.showmapComponent.passNodes();
    this.legend = this.getNodes();
    this.printLegend = this.printMapLegend(this.legend, 400, 600, true);
  }

  EmitToolTips() {
    console.log(this.legend);
    this.getLegendNodes.emit(this.printLegend);
  }

  getNodes() {
    var legendNodes: Legend[] = [];
    console.log(this.myMapNodes);
    for (let n in this.myMapNodes) {
      legendNodes.push(new Legend(
        this.mapNodes[n].x,
        this.mapNodes[n].y,
        this.mapNodes[n].item.svg,
        this.mapNodes[n].height,
        this.mapNodes[n].radius,
        this.assignTerrainType(this.mapNodes[n].item.svg, this.mapNodes[n].height)
      ));
    }
    console.log(legendNodes);
    return legendNodes;
  }

  assignTerrainType(type: string, height: number) {
    console.log(type);
    if (type === 'boulder' || type === 'boulder2' || type === 'boulder3' || type === 'house' || type === 'wood_building') {
      return 'Blocking Terrain';
    } else if (type === 'crop_field' || type === 'pond') {
      return 'Difficult Terrain';
    } else if (type === 'hedge_wall' || type === 'hedge_wall2' || type === 'stone_wall' || type === 'wood_wall_1') {
      if (height >= 2) {
        return 'Blocking Terrain';
      } else if (height <= 1) {
        return 'Obstacle Terrain';
      };
    } else if (type === 'tree' || type === 'foliage') {
      if (height > 2) {
        return 'Blocking Terrain';
      } else if (height <= 2) {
        return 'Difficult Terrain';
      };
    } else if (type === 'hill') {
      return 'Hill Terrain';
    };
  }



  /**
   * this function takes the array of tooltips and prints it to the canvas.
   *
   * @param encoding - this array of tooltips taken from the map Nodes
   * @param h - indicates the height of the map to be printed
   * @param w - indicated the width of the map to be printed
   * @param debug - indicates whether or not to print debug info (bounding circles and spawn pts)
   */
   printMapLegend(encoding: Legend[], h: number, w: number, debug: boolean) {
    let lCanvas = document.getElementById('legendViewer') as HTMLCanvasElement;
    if (!lCanvas) {
      while (!lCanvas) {
        // sometimes the canvas takes a bit to load in
        console.debug('[printMapLegend] Looking for canvas "legendViewer"...');
        lCanvas = document.getElementById('legendViewer') as HTMLCanvasElement;
        //await sleep(150);
      }
      console.debug('[printMapLegend] Found canvas!');
    }
    const lCtx = lCanvas.getContext('2d') as CanvasRenderingContext2D;
    lCtx.clearRect(0, 0, lCtx.canvas.width, lCtx.canvas.height);
    if (!this.showmapComponent.showWidth) {
      while (!this.showmapComponent.showWidth) {
        // showWidth takes a moment to load when page refreshes
        console.debug('[printMapLegend] Looking for showWidth...');
        //await sleep(150);
      }
      console.debug('[printMapLegend] Found showWidth!');
    }
    const width = this.showmapComponent.showWidth.nativeElement.offsetWidth;
    lCtx.canvas.width = width;
    lCtx.canvas.height = width * .66;
    lCtx.scale(width / w, width * .66 / h);

    //code to draw items
    this.itemsToLoad = encoding.length; //these are used to make sure onLoad is called when all items have been rendered
    this.itemsLoaded = 0;
    for (const p of encoding) {
      const img = new Image(0, 0);
      console.log(p);
      const scaleFactor = p.radius * 2;
      const type_text = p.type;
      const item_text = p.item;
      const height_text = "Height: " + p.height;
      const textWidth = lCtx.measureText(type_text).width;
      if (p.x >= 500) {//this is to adjust for any items that go off the map on the right side
        lCtx.fillText(type_text, (p.x - 40), (p.y - 20));
        lCtx.fillText(item_text, (p.x - 40), (p.y - 5));
        lCtx.fillText(height_text, (p.x - 40), (p.y + 10));
        lCtx.strokeRect((p.x - 50), (p.y - 32), textWidth + 10, 50);
      } else {
        lCtx.fillText(type_text, (p.x-32), (p.y - 20));
        lCtx.fillText(item_text, (p.x-32), (p.y - 5));
        lCtx.fillText(height_text, (p.x-32), (p.y + 10));
        lCtx.strokeRect((p.x - 35), (p.y - 32), textWidth + 10, 50);
      }
      this.itemsLoaded++;

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


