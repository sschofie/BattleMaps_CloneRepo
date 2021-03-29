import { Component, ElementRef, OnInit, TemplateRef, ViewChild, ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { ClipboardService } from 'ngx-clipboard';
import * as epicDwarfMaps from '../../assets/epic-dwarf-maps.json';

@Component({
  selector: 'app-show-map',
  templateUrl: './show-map.component.html',
  styleUrls: [
    './show-map.component.css',
    '../../assets/simple-line-icons/css/simple-line-icons.css'
  ]
})

export class ShowMapComponent implements OnInit {
  static readonly maxInt32Unsigned = 4294967296;
  static readonly scenarios = [
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
  @ViewChild('showWidth') showWidth: ElementRef;
  dwarfText = '';
  selectedScenario = '';
  isLongLoading = false;
  qrCodeString = '';
  private baseURL = environment.appURL;
  private changeScenarioOnly = false;
  private isLoading: boolean;
  private tmpDwarfText: string;
  private tmpSelectedScenario: string;
  private maxRuns = 50; //universal limit to number of runs each generation is allowed.
  private seedrandom = require('seedrandom');
  private rand;
  private itemsToLoad: number;
  private itemsLoaded: number;
  private terrainPieces: [string, TerrainPiece][] = [ //reference array for pre-defined items. Others culd be read in from Json file.
    ['stone_wall', new TerrainPiece(0, 35, 1, 'stone_wall')],
    ['pond', new TerrainPiece(1, 45, 1, 'pond')],
    ['house', new TerrainPiece(2, 25, 1, 'house')],
    ['tree', new TerrainPiece(3, 40, 1, 'tree')],
    ['boulder', new TerrainPiece(4, 38, 1, 'boulder')],  // mountain
    ['boulder2', new TerrainPiece(5, 40, 1, 'boulder2')], // rock hill
    ['boulder3', new TerrainPiece(6, 40, 1, 'boulder3')], // grass hill
    ['foliage', new TerrainPiece(7, 40, 1, 'foliage')],
    ['crop_field', new TerrainPiece(8, 35, 1, 'crop_field')],
    ['stone_wall', new TerrainPiece(9, 35, 1, 'hedge_wall')],
    ['stone_wall', new TerrainPiece(10, 35, 1, 'hedge_wall2')],
    ['wood_building', new TerrainPiece(11, 25, 1, 'wood_building')],
    ['wood_wall_1', new TerrainPiece(12, 40, 1, 'wood_wall_1')],
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private clipboardService: ClipboardService
  ) { }

  ngOnInit() {
    this.startSpinner();
    // update the displayed information whenever the queries are updated
    this.route.queryParams.subscribe(() => {
      // if setting the scenario fails, pick a new scenario
      if (!this.setScenarioFromQuery()) {
        console.debug('Generating new scenario...');
        this.switchScenario(true);
      }
      // check whether we're only changing the scenario, then:
      // if setting the map fails, pick a new map
      if (!this.changeScenarioOnly && !this.setMapFromQuery()) {
        console.debug('Generating new map...');
        this.switchMap(true);
      }
      this.changeScenarioOnly = false;
    });
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

  /**
   * Called when "Switch Scenario" button is clicked. Ensures that only the scenario is changed.
   */
  onSwitchScenarioButtonClick() {
    this.changeScenarioOnly = true;
    this.switchScenario(true);
  }

  /**
   * Pick a random scenario and map and update the URL accordingly.
   */
  switchMapAndScenario() {
    this.router.navigate(['/app'], {
      queryParams: {
        s: this.switchScenario(false),
        map: this.switchMap(false)
      }
    });
  }

  /**
   * Pick a new random scenario ID.
   *
   * @param navigate Whether to update URL query parameters.
   *
   * @returns New scenario ID.
   */
  switchScenario(navigate: boolean): number {
    const oldScenarioID = parseInt(this.route.snapshot.queryParamMap.get('s'), 10);
    let scenarioID = oldScenarioID;
    while (scenarioID === oldScenarioID || isNaN(scenarioID)) { // make sure we're actually picking a new scenario
      scenarioID = Math.floor(Math.random() * ShowMapComponent.scenarios.length);
    }
    if (navigate) {
      // update the URL with the chosen information
      this.router.navigate(['/app'], { queryParams: { s: scenarioID }, queryParamsHandling: 'merge' });
    }
    return scenarioID;
  }

  /**
   * Pick a new random map ID.
   *
   * @param navigate Whether to update URL query parameters.
   *
   * @returns New map ID.
   */
  switchMap(navigate: boolean): string {
    if (this.changeScenarioOnly) { console.warn('WARN: How did we get here?'); return null; } // just in case
    this.startSpinner();
    let mapID: string;
    const oldMapID = this.route.snapshot.queryParamMap.get('map');
    mapID = oldMapID;
    while (mapID === oldMapID) { // make sure we're actually picking a new map
      if (environment.featureFlags.dynamicMaps) {
        // generate a random seed
        mapID = Math.floor(Math.random() * ShowMapComponent.maxInt32Unsigned).toString();
      }
      else {
        // pick a random Epic Dwarf map
        const mapCount = 20;
        mapID = 'ed' + (Math.round(Math.random() * (mapCount - 1)) + 1);
      }
    }
    if (navigate) {
      // update the URL with the chosen information
      this.router.navigate(['/app'], { queryParams: { map: mapID }, queryParamsHandling: 'merge' });
    }
    return mapID;
  }

  /**
   * Set the scenario based on the current url query parameters.
   *
   * @returns False if scenario ID is invalid or does not exist.
   */
  setScenarioFromQuery(): boolean {
    // load the scenario ID
    const scenarioID = this.route.snapshot.queryParamMap.get('s');
    // check that the 'scenario' parameter exists
    if (!scenarioID) { console.debug('Scenario ID not provided.'); return false; }
    this.tmpSelectedScenario = ShowMapComponent.scenarios[scenarioID];
    // check that we have a valid scenario
    if (!this.tmpSelectedScenario) { console.warn('WARN: Invalid scenario ID.'); return false; }
    if (this.changeScenarioOnly) { this.onLoad(); }
    return true;
  }

  /**
   * Set the map based on the current url query parameters.
   *
   * @returns False if map ID is invalid or does not exist.
   */
  setMapFromQuery(): boolean {
    // load the map ID
    const mapID = this.route.snapshot.queryParamMap.get('map');
    // check that the 'map' parameter exists
    if (!mapID) { console.debug('Map ID not provided.'); return false; }
    if (mapID.startsWith('ed', 0)) {
      const mapNum = Number(mapID.replace('ed', ''));
      // check that we have a valid map number
      if (isNaN(mapNum) || mapNum < 1 || mapNum > 20) {
        console.warn('WARN: Invalid Epic Dwarf map ID.');
        return false;
      }
      this.printMap(this.getEpicDwarfMapEncoding(mapNum), 400, 600, false);
      this.tmpDwarfText = 'Lars\' Epic Dwarf map #' + mapNum;
    }
    else {
      if (!environment.featureFlags.dynamicMaps) {
        // for now we don't want to use maps other than ed
        console.warn('WARN: Invalid map ID (not an Epic Dwarf ID).');
        return false;
      }

      const mapSeed = Number(mapID);
      // check that we have a valid seed
      if (isNaN(mapSeed) || mapSeed < 0 || mapSeed > ShowMapComponent.maxInt32Unsigned) {
        console.warn('WARN: Map seed is invalid.');
        return false;
      }
      this.printMap(this.simpleGenerate(400, 600, 50, null, false, mapSeed), 400, 600, false);
      this.tmpDwarfText = 'Dynamically generated map';
    }
    return true;
  }

  /**
   * Sets the QR code string based on the current map, then opens a modal using the given template.
   *
   * @param modal - The modal HTML template.
   */
  openShareModal(modal: TemplateRef<NgbModal>) {
    this.qrCodeString = this.baseURL + this.router.url;
    this.modalService.open(modal, { ariaLabelledBy: 'shareModalTitle' });
  }



  /**
   * Shares link to current map via mobile OS share menu if available, otherwise copies URL to clipboard.
   */
  shareURL() {
    const linkURL = this.baseURL + this.router.url;
    if (navigator.share) {
      navigator.share({
        url: linkURL
      });
    } else {
      this.clipboardService.copy(linkURL);
    }
  }

  // Generaton code starts here. =======================================================================================

  /**
   * generate map encoding (Node[])
   *
   * @param mapHeight - height of the map (usually 400)
   * @param mapWidth - width of the map (usually 600)
   * @param edgeBoundary - distance from the map edge in which objects cannot spawn
   * @param resources - an array of numbers representing the available resources where index equals id
   * @param weighted - toggle weighted generation
   * @param seed - a 32 bit unsigned int to generate a specific map
   */
  simpleGenerate(mapHeight: number, mapWidth: number, edgeBoundary: number,
    resources: number[], weighted: boolean, seed: number): Node[] {
    this.rand = this.seedrandom(seed);
    const numOfItems = this.terrainPieces.length;
    const boundScaling = 0.85; //this scales the bounding circle allowing object to overlap slightly.
    const nodes: Node[] = [];
    const runs = 0;
    let numOfNodes = Math.floor(this.rand() * 4) + 8; //designates number of terrain pieces with a max of 12 and min of 8.
    let numPiecesAvailable = 0;
    if (resources != null) {
      for (const n of resources) {
        numPiecesAvailable += n;
      }
      if (numOfNodes > numPiecesAvailable) {
        numOfNodes = numPiecesAvailable;
      }
    }
    while (nodes.length < numOfNodes && runs < this.maxRuns) {
      const item: TerrainPiece = this.selectTP(numOfItems, weighted, resources);
      const tempX = Math.floor(this.rand() * (mapWidth - edgeBoundary)) + edgeBoundary;
      const tempY = Math.floor(this.rand() * (mapHeight - edgeBoundary)) + edgeBoundary;
      if (!this.checkForOverlap(nodes, item, tempX, tempY)) {
        nodes.push(new Node(tempX, tempY, Math.floor(this.rand() * 2 * Math.PI), (item.radius * boundScaling), item, -1));
        if (resources != null) {
          resources[item.id]--;
        }
      }
    }
    return nodes;
  }

  /**
   * Selects a random terrain piece
   *
   * @param numOfItems - the number of items in TerrainPieces
   * @param weighted - toggle whether the generation is weighted
   * @param resources - an array of numbers representing the available resources where index equals id
   * @returns a random TerrainPiece
   */
  selectTP(numOfItems: number, weighted: boolean, resources: number[]): TerrainPiece {
    let item: TerrainPiece = null;
    while (item == null) {
      item = this.terrainPieces[Math.floor(this.rand() * (numOfItems - 1))][1];
      if ((resources != null) && (resources[item.id] < 1)) {
        item = null;
      }
      if (weighted && item.weight < this.rand()) {
        item = null;
      }
    }
    return item;
  }

  /**
   *
   * @param nodes - an array of nodes to compare against
   * @param item - potential terrain piece to check for overlap
   * @param x - the x coordinate of the potential location
   * @param y - the y coordinate of the potential location
   * @returns - boolean to indicate whether there is any overlap
   */
  checkForOverlap(nodes: Node[], item: TerrainPiece, x: number, y: number): boolean {
    let overlap = false;
    for (let i = 0; i < nodes.length; i++) { //checks the temp bounding circle against existing node bounding circles.
      const circle = nodes[i];
      if (dist(circle.x, circle.y, x, y) < circle.radius + item.radius) {
        overlap = true;
        i = nodes.length;
      }
    }
    return overlap;
  }

  /**
   * Convert a given map json object into a valid map encoding.
   *
   * @param mapNum - The Epic Dwarf map number.
   * @returns An encoding of the input map which can be used in printMap.
   */
  getEpicDwarfMapEncoding(mapNum: number): Node[] {
    // get the appropriate map object from epic-dwarf-maps.json
    let mapObject: { item: string; x: number; y: number; angle: number }[];
    switch (mapNum) {
      case 1: mapObject = epicDwarfMaps.ed1; break;
      case 2: mapObject = epicDwarfMaps.ed2; break;
      case 3: mapObject = epicDwarfMaps.ed3; break;
      case 4: mapObject = epicDwarfMaps.ed4; break;
      case 5: mapObject = epicDwarfMaps.ed5; break;
      case 6: mapObject = epicDwarfMaps.ed6; break;
      case 7: mapObject = epicDwarfMaps.ed7; break;
      case 8: mapObject = epicDwarfMaps.ed8; break;
      case 9: mapObject = epicDwarfMaps.ed9; break;
      case 10: mapObject = epicDwarfMaps.ed10; break;
      case 11: mapObject = epicDwarfMaps.ed11; break;
      case 12: mapObject = epicDwarfMaps.ed12; break;
      case 13: mapObject = epicDwarfMaps.ed13; break;
      case 14: mapObject = epicDwarfMaps.ed14; break;
      case 15: mapObject = epicDwarfMaps.ed15; break;
      case 16: mapObject = epicDwarfMaps.ed16; break;
      case 17: mapObject = epicDwarfMaps.ed17; break;
      case 18: mapObject = epicDwarfMaps.ed18; break;
      case 19: mapObject = epicDwarfMaps.ed19; break;
      case 20: mapObject = epicDwarfMaps.ed20; break;
      default: mapObject = epicDwarfMaps.ed1; break;
    }

    // build a list of nodes using the information in the mapObject
    const nodes: Node[] = new Array(mapObject.length);
    for (let i = 0; i < mapObject.length; i++) {
      // get the terrainPiece that corresponds with this mapObject
      const piece: TerrainPiece = this.terrainPieces.find(elem => elem[0] === mapObject[i].item)[1];
      nodes[i] = new Node(
        mapObject[i].x,
        mapObject[i].y,
        mapObject[i].angle * Math.PI / 180,
        piece.radius * .85,
        piece,
        -1
      );
    }
    return nodes;
  }

  /**
   * this function takes a valid encoding and prints it to the canvas.
   *
   * @param encoding - this array of nodes represents the map
   * @param h - indicates the height of the map to be printed
   * @param w - indicated the width of the map to be printed
   * @param debug - indicates whether or not to print debug info (bounding circles and spawn pts)
   */
  async printMap(encoding: Node[], h: number, w: number, debug: boolean) {
    const gridSpacing = 100; //could be a param later
    let canvas = document.getElementById('mapViewer') as HTMLCanvasElement;
    if (!canvas) {
      while (!canvas) {
        // sometimes the canvas takes a bit to load in
        console.debug('[printMap] Looking for canvas...');
        canvas = document.getElementById('mapViewer') as HTMLCanvasElement;
        await sleep(150);
      }
      console.debug('[printMap] Found canvas!');
    }
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (!this.showWidth) {
      while (!this.showWidth) {
        // showWidth takes a moment to load when page refreshes
        console.debug('[printMap] Looking for showWidth...');
        await sleep(150);
      }
      console.debug('[printMap] Found showWidth!');
    }
    const width = this.showWidth.nativeElement.offsetWidth;
    ctx.canvas.width = width;
    ctx.canvas.height = width * .66;
    ctx.scale(width / w, width * .66 / h);
    ctx.fillStyle = 'rgb(112,179,68)';
    ctx.strokeStyle = 'rgb(95, 115, 46)';
    ctx.fillRect(0, 0, ctx.canvas.width * w, ctx.canvas.height * h);
    //code to draw grid
    for (let i = gridSpacing; i < w; i += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, h);
      ctx.stroke();
    }
    for (let i = gridSpacing; i < h; i += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(w, i);
      ctx.stroke();
    }
    //code to draw items
    this.itemsToLoad = encoding.length; //these are used to make sure onLoad is called when all items have been rendered
    this.itemsLoaded = 0;
    ctx.fillStyle = 'red';
    for (const p of encoding) {
      const img = new Image(0, 0);
      img.src = 'assets/img/svg_map_pieces/' + p.item.svg + '.svg';
      const scaleFactor = p.item.radius * 2;
      img.onload = () => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.drawImage(img, -p.item.radius, -p.item.radius, scaleFactor, scaleFactor);
        ctx.restore();
        this.itemsLoaded++;
        //if we've loaded all the items, then call onLoad
        if (this.itemsLoaded >= this.itemsToLoad) {
          this.onLoad();
        }
      };
      if (debug) {
        ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const dist = (x1: number, y1: number, x2: number, y2: number): number => {
  const a = x1 - x2;
  const b = y1 - y2;
  return Math.sqrt(a * a + b * b);
};

//represents a terrain piece and its circle boundary
class Node {
  public x: number;
  public y: number;
  public angle: number; // angle of rotation in radians
  public radius: number; //might be able to remove this later as item.radius is a scaled version of this.
  public height: number; // height of terrain piece
  public item: TerrainPiece;

  public constructor(x, y, angle, radius, item, height) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.radius = radius;
    this.item = item;
    this.height = this.setHeight(height);
  }
  setHeight(height: number) {
    if (height !== -1) {
      return height;
    } else {
      let num = 0;
      if (this.item.svg === 'pond') {
        num = 0;
      } else if (this.item.svg === 'stone_wall' || this.item.svg === 'hedge_wall' ||
        this.item.svg === 'hedge_wall2' || this.item.svg === 'crop_field' || this.item.svg === 'wood_wall') {
        num = 1;
      } else if (this.item.svg === 'foliage') {
        num = 2;
      } else {
        num = Math.floor(Math.random() * 3) + 2;
      }
      return num;
    }
  }
}

//represents a single pre-defined piece of terrain.
class TerrainPiece {
  public id: number; //index in the terrainPieces array
  public radius: number; //radius of the bounding circle
  public weight: number; // beween 0 and 1
  public svg: string; //name of the svg image.
  public height: number;

  public constructor(id: number, r: number, w: number, img: string) {
    this.id = id;
    this.radius = r;
    this.weight = w;
    this.svg = img;
  }
}

// may be used for groups of terrain pieces dow the line.
class Group {
  public weight: number;
  public radius: number;
  public items: number[]; //array of terrain piece ids.

  public constructor(w: number, r: number, i: any[]) {
    this.weight = w;
    this.radius = r;
    this.items = i;
  }
}
