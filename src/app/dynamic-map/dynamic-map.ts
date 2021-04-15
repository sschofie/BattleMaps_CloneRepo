import { ShowMapComponent } from '../show-map/show-map.component';
import { GeneratorSettingsService } from '../collapse-basic/generator-settings.service';
import * as epicDwarfMaps from '../../assets/epic-dwarf-maps.json';
import { SystemJsNgModuleLoader } from '@angular/core';

//represents a single pre-defined piece of terrain.
export class TerrainPiece {
  public id: number; //index in the terrainPieces array
  public type: TerrainPiece.Type;
  public radius: number; //radius of the bounding circle
  public weight: number; // beween 0 and 1
  public svg: string; //name of the svg image.
  public height: number;

  public constructor(id: number, type: TerrainPiece.Type, r: number, w: number, img: string) {
    this.id = id;
    this.type = type;
    this.radius = r;
    this.weight = w;
    this.svg = img;
  }
}

export namespace TerrainPiece { // eslint-disable-line @typescript-eslint/no-namespace
  export enum Type {
    blocking = 0,
    difficult,
    obstacle,
    hill,
    forest
  }
}

export class DynamicMap {
  static readonly maxInt32Unsigned = 4294967296;
  static readonly terrainPieces: [string, TerrainPiece][] = [
    ['stone_wall', new TerrainPiece(0, TerrainPiece.Type.obstacle, 35, 1, 'stone_wall')],
    ['pond', new TerrainPiece(1, TerrainPiece.Type.difficult, 45, 1, 'pond')],
    ['house', new TerrainPiece(2, TerrainPiece.Type.blocking, 25, 1, 'house')],
    ['tree', new TerrainPiece(3, TerrainPiece.Type.forest, 40, 1, 'tree')],
    ['boulder', new TerrainPiece(4, TerrainPiece.Type.blocking, 38, 1, 'boulder')],  // mountain
    ['boulder2', new TerrainPiece(5, TerrainPiece.Type.hill, 40, 1, 'boulder2')], // rock hill
    ['boulder3', new TerrainPiece(6, TerrainPiece.Type.hill, 40, 1, 'boulder3')], // grass hill
    ['foliage', new TerrainPiece(7, TerrainPiece.Type.forest, 40, 1, 'foliage')],
    ['crop_field', new TerrainPiece(8, TerrainPiece.Type.difficult, 35, 1, 'crop_field')],
    ['stone_wall', new TerrainPiece(9, TerrainPiece.Type.obstacle, 35, 1, 'hedge_wall')],
    ['stone_wall', new TerrainPiece(10, TerrainPiece.Type.obstacle, 35, 1, 'hedge_wall2')],
    ['wood_building', new TerrainPiece(11, TerrainPiece.Type.blocking, 25, 1, 'wood_building')],
    ['wood_wall_1', new TerrainPiece(12, TerrainPiece.Type.obstacle, 40, 1, 'wood_wall_1')],
  ];
  mapNodes: Node[]; //keep track of the current map for other funcions
  generatorSettings: GeneratorSettingsService;
  private context: ShowMapComponent;
  private maxRuns = 50; //universal limit to number of runs each generation is allowed.
  private seedrandom = require('seedrandom');
  private rand;
  private itemsToLoad: number;
  private itemsLoaded: number;



  static newSeed(): number {
    return Math.floor(Math.random() * DynamicMap.maxInt32Unsigned);
  }

  static isValidSeed(seed: number): boolean {
    return !isNaN(seed) && seed > 0 && seed < DynamicMap.maxInt32Unsigned;
  }

  /**
   * Generate the given Epic Dwarf map and print it to the canvas.
   *
   * @param context - the ShowMapComponent to be referenced.
   * @param mapNum - an integer 1-20 indicating the Epic Dwarf map to print.
   */
  printEpicDwarfMap(context: ShowMapComponent, mapNum: number): Node[] {
    this.context = context;
    this.mapNodes = this.getEpicDwarfMapEncoding(mapNum);
    this.printMap(this.mapNodes, 400, 600, false);
    return this.mapNodes;
  }

  /**
   * Generate a dynamic map and print it to the canvas.
   *
   * @param context - the ShowMapComponent to be referenced.
   * @param seed - a 32 bit unsigned int to generate a specific map
   */
  generateAndPrintMap(context: ShowMapComponent, seed: number): Node[] {
    this.context = context;
    this.mapNodes = this.simpleGenerate(400, 600, 50, false, seed);
    this.printMap(this.mapNodes, 400, 600, false);
    return this.mapNodes;
  }

  /**
   * generate map encoding (Node[])
   *
   * @param mapHeight - height of the map (usually 400)
   * @param mapWidth - width of the map (usually 600)
   * @param edgeBoundary - distance from the map edge in which objects cannot spawn
   * @param weighted - toggle weighted generation
   * @param seed - a 32 bit unsigned int to generate a specific map
   */
  private simpleGenerate(mapHeight: number, mapWidth: number, edgeBoundary: number,
    weighted: boolean, seed: number): Node[] {
    const resources = this.generatorSettings.resources.slice();
    this.rand = this.seedrandom(seed);
    const boundScaling = 0.85; //this scales the bounding circle allowing object to overlap slightly.
    const nodes: Node[] = [];
    let runs = 0;
    let numOfNodes = Math.floor(this.rand() * 4) + 8; //designates number of terrain pieces with a max of 12 and min of 8.
    let numPiecesAvailable = 0;
    if (resources.length > 0) {
      if (resources.every(val => val === 0)) {
        // if there is zero of every resource, don't bother trying to place nodes
        this.context.onLoad();
        return [];
      }
      for (const n of resources) {
        numPiecesAvailable += n;
      }
      if (numOfNodes > numPiecesAvailable) {
        numOfNodes = numPiecesAvailable;
      }
    }
    while (nodes.length < numOfNodes && runs < this.maxRuns) {
      const item: TerrainPiece = this.selectTP(weighted, resources);
      const tempX = Math.floor(this.rand() * (mapWidth - edgeBoundary*2)) + edgeBoundary;
      const restrictHills = (this.generatorSettings === null || this.generatorSettings === undefined) ? true :
        this.generatorSettings.hillNotInZones;
      if(item.type === TerrainPiece.Type.hill && restrictHills) {
        const tempY = Math.floor(this.rand()/2 * (mapHeight - edgeBoundary*4)) + mapHeight/4;
        if (!this.checkForOverlap(nodes, item, tempX, tempY)) {
          nodes.push(new Node(tempX, tempY, 0, (item.radius * boundScaling), item, -1));
          if (resources.length > 0) {
            resources[item.type]--;
          }
        }
      } else{
        const tempY = Math.floor(this.rand() * (mapHeight - edgeBoundary*2)) + edgeBoundary;
        if (!this.checkForOverlap(nodes, item, tempX, tempY)) {
          const angle = (item.type === TerrainPiece.Type.hill) ? 0 : Math.floor(this.rand() * 2 * Math.PI);
          nodes.push(new Node(tempX, tempY, angle, (item.radius * boundScaling), item, -1));
          if (resources.length > 0) {
            resources[item.type]--;
          }
        }
      }
      runs++;
    }
    return nodes;
  }

  /**
   * Selects a random terrain piece
   *
   * @param weighted - toggle whether the generation is weighted
   * @param resources - an array containing the quantity of each item type in order of: Blocking, Difficult, Obstacle, Hill, Forest
   * @returns a random TerrainPiece
   */
  private selectTP(weighted: boolean, resources: number[]): TerrainPiece {
    // get a random type (constrained by resources)
    let type: TerrainPiece.Type = null;
    while (type == null) {
      type = Math.floor(this.rand() * Object.keys(TerrainPiece.Type).length / 2) as TerrainPiece.Type;
      if (resources.length > 0) { // if we have resources, make sure there's enough of this type
        if (type >= resources.length) {
          type = null;
        } else if (resources[type] < 1) {
          type = null;
        }
      }
    }

    // get a random TerrainPiece of that type
    let item: TerrainPiece = null;
    do {
      item = DynamicMap.terrainPieces[Math.floor(this.rand() * DynamicMap.terrainPieces.length)][1];
    } while (item.type !== type || (weighted && item.weight < this.rand()));

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
  private checkForOverlap(nodes: Node[], item: TerrainPiece, x: number, y: number): boolean {
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
  private getEpicDwarfMapEncoding(mapNum: number): Node[] {
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
      const piece: TerrainPiece = DynamicMap.terrainPieces.find(elem => elem[0] === mapObject[i].item)[1];
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
  private async printMap(encoding: Node[], h: number, w: number, debug: boolean) {
    const gridSpacing = 100; //could be a param later
    let canvas = document.getElementById('mapViewer') as HTMLCanvasElement;
    if (!canvas) {
      while (!canvas) {
        // sometimes the canvas takes a bit to load in
        console.debug('[DynamicMap] Looking for canvas "mapViewer"...');
        canvas = document.getElementById('mapViewer') as HTMLCanvasElement;
        await sleep(150);
      }
      console.debug('[DynamicMap] Found canvas!');
    }
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (!this.context.showWidth) {
      while (!this.context.showWidth) {
        // showWidth takes a moment to load when page refreshes
        console.debug('[DynamicMap] Looking for showWidth...');
        await sleep(150);
      }
      console.debug('[DynamicMap] Found showWidth!');
    }

    const width = this.context.showWidth.nativeElement.offsetWidth;
    ctx.canvas.width = width;
    ctx.canvas.height = width * .66 ;
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
          this.context.onLoad();
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

export const dist = (x1: number, y1: number, x2: number, y2: number): number => {
  const a = x1 - x2;
  const b = y1 - y2;
  return Math.sqrt(a * a + b * b);
};

//represents a terrain piece and its circle boundary
export class Node {
  public x: number;
  public y: number;
  public angle: number; // angle of rotation in radians
  public radius: number; //might be able to remove this later as item.radius is a scaled version of this.
  public height: number; // height of terrain piece
  public item: TerrainPiece;

  public constructor(x: number, y: number, angle: number, radius: number, item: TerrainPiece, height: number) {
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
      } else if (this.item.type === TerrainPiece.Type.obstacle || this.item.svg === 'crop_field') {
        num = 1;
      } else if (this.item.type === TerrainPiece.Type.forest) {
        num = 2;
      } else {
        num = Math.floor(Math.random() * 3) + 2;
      }
      return num;
    }
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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
