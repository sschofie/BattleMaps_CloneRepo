import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { ShowMapComponent } from '../show-map.component';


@Component({
  selector: 'app-map-tooltips',
  templateUrl: './tool-tips.component.html',
  styleUrls: ['./tool-tips.component.css']
})
export class ToolTipsComponent implements OnInit {
  @Input() mapNodes:Node[];
  @Input() showToolTips: boolean;
  @Input() passNodes: Function;
  @Output() getToolTips = new EventEmitter<void>();
  tooltips:ToolTip[];
  private itemsToLoad: number;
  private itemsLoaded: number;
  myMapNodes;
  printTips;

  constructor(
    private showmapComponent: ShowMapComponent
  ) { }

  ngOnInit() {
    this.myMapNodes = this.showmapComponent.passNodes();
    this.tooltips = this.getNodes();
    this.printTips = this.printToolTips(this.tooltips, 400, 600, true);
  }

  EmitToolTips(){
    console.log(this.tooltips);
    this.getToolTips.emit(this.printTips);
  }

  getNodes(){
    var tooltipNodes: ToolTip[] = [];
    console.log(this.myMapNodes);
    for(let n in this.myMapNodes){
      tooltipNodes.push(new ToolTip(
        this.mapNodes[n].x,
        this.mapNodes[n].y,
        this.mapNodes[n].item.svg,
        this.mapNodes[n].height,
        this.mapNodes[n].radius,
        this.assignTerrainType(this.mapNodes[n].item.svg, this.mapNodes[n].height)
      ));
    }
    console.log(tooltipNodes);
    return tooltipNodes;
  }

  assignTerrainType(type: string, height: number){
    console.log(type);
    if(type === 'boulder' || type === 'boulder2' || type === 'boulder3' || type === 'house' || type === 'wood_building'){
      return 'Blocking Terrain';
    }else if (type === 'crop_field' || type === 'pond'){
      return 'Difficult Terrain';
    }else if (type === 'hedge_wall' || type === 'hedge_wall2' || type === 'stone_wall' || type === 'wood_wall_1'){
      if(height >= 2){
        return 'Blocking Terrain';
      }else if(height <= 1){
        return 'Obstacle Terrain';
      };
    }else if (type === 'tree' || type === 'foliage'){
      if(height > 2){
        return 'Blocking Terrain';
      }else if(height <= 2){
        return 'Difficult Terrain';
      };
    }else if (type === 'hill'){
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
   printToolTips(encoding: ToolTip[], h: number, w: number, debug: boolean) {
    let tipCanvas = document.getElementById('tooltipViewer') as HTMLCanvasElement;
    if (!tipCanvas) {
      while (!tipCanvas) {
        // sometimes the canvas takes a bit to load in
        console.debug('[printToolTips] Looking for canvas "tooltipViewer"...');
        tipCanvas = document.getElementById('tooltipViewer') as HTMLCanvasElement;
        //await sleep(150);
      }
      console.debug('[printToolTips] Found canvas!');
    }
    const tipCtx = tipCanvas.getContext('2d') as CanvasRenderingContext2D;
    tipCtx.clearRect(0, 0, tipCtx.canvas.width, tipCtx.canvas.height);
    if (!this.showmapComponent.showWidth) {
      while (!this.showmapComponent.showWidth) {
        // showWidth takes a moment to load when page refreshes
        console.debug('[printToolTips] Looking for showWidth...');
        //await sleep(150);
      }
      console.debug('[printToolTips] Found showWidth!');
    }
    const width = this.showmapComponent.showWidth.nativeElement.offsetWidth;
    tipCtx.canvas.width = width;
    tipCtx.canvas.height = width * .66;
    tipCtx.scale(width / w, width * .66 / h);

    //code to draw items
    this.itemsToLoad = encoding.length; //these are used to make sure onLoad is called when all items have been rendered
    this.itemsLoaded = 0;
    for (const p of encoding) {
      const img = new Image(0, 0);
      console.log(p);
      const scaleFactor = p.radius * 2;
      const type_text = p.type;
      const item_text = p.item;
      const height_text = "Height: "+p.height;
      const textWidth = tipCtx.measureText(type_text).width;
        if(p.x >= 400){//this is to adjust for any items that go off the map on the right side
          tipCtx.fillText(type_text, (p.x-80), (p.y-30));
          tipCtx.fillText(item_text, (p.x-80), (p.y-15));
          tipCtx.fillText(height_text, (p.x-80), (p.y));
          tipCtx.strokeRect((p.x-90), (p.y-40), textWidth+15, 50);
        }else{
          tipCtx.fillText(type_text, (p.x), (p.y-30));
          tipCtx.fillText(item_text, (p.x), (p.y-15));
          tipCtx.fillText(height_text, (p.x), (p.y));
          tipCtx.strokeRect((p.x-5), (p.y-40), textWidth+15, 50);
        }
        this.itemsLoaded++;

    }
  }

}


export class ToolTip {
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


