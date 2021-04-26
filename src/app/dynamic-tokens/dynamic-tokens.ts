import { ShowMapComponent } from '../show-map/show-map.component';
import { dist, Node, TerrainPiece } from '../dynamic-map/dynamic-map';
import { environment } from 'src/environments/environment';

export class DynamicTokens {
  static readonly maxInt32Unsigned = 4294967296;
  private readonly width = 600;
  private readonly height = 400;
  private readonly maxAttempts = 100; // max number of attempts to place a token
  private seedrandom = require('seedrandom');
  private rand: () => number;
  private showMapComponent: ShowMapComponent;
  private mapNodes: Node[];
  private tokens: Token[];
  private isPlunder = false;

  static newSeed(): number {
    return Math.floor(Math.random() * DynamicTokens.maxInt32Unsigned);
  }

  static isValidSeed(seed: number): boolean {
    return !isNaN(seed) && seed > 0 && seed < DynamicTokens.maxInt32Unsigned;
  }

  /**
   * Dynamically generate tokens for the given scenario and print them to the 'tokenViewer' canvas.
   *
   * @param showMapComponent Component containing the target canvas.
   * @param mapNodes Array that contains the current map encoding.
   * @param scenario The scenario for which to generate tokens.
   */
  generateAndPrintTokens(showMapComponent: ShowMapComponent, mapNodes: Node[], scenario: string, seed: number) {
    if (!environment.featureFlags.tokens) { return; }
    this.mapNodes = mapNodes;
    this.showMapComponent = showMapComponent;
    this.generateTokens(scenario, seed);
    if (environment.production) {
      this.printTokens(this.tokens, this.width, this.height);
    } else {
      this.printTokens(this.tokens, this.width, this.height, 2);
    }
    if((scenario === `Fool's Gold`) || (scenario === `Smoke & Mirrors`)) {
      this.showMapComponent.toastScenarioInfoService.show(
        `Scenario Info`,
        `see p. 62`,
        `Determine token values based on ` + scenario + ` details in rulebook`
        );
    } else {
      this.showMapComponent.toastScenarioInfoService.toasts = [];
    }
  }

  /**
   * Clear the 'tokenViewer' canvas.
   */
  async clearTokens() {
    this.tokens = [];
    let canvas = document.getElementById('tokenViewer') as HTMLCanvasElement;
    if (!canvas) {
      while (!canvas) {
        // sometimes the canvas takes a bit to load in
        console.debug('[DynamicTokens] Looking for canvas "tokenViewer"...');
        canvas = document.getElementById('tokenViewer') as HTMLCanvasElement;
        await sleep(150);
      }
      console.debug('[DynamicTokens] Found canvas!');
    }
    this.isPlunder = false;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, 600, 400);
  }

  /**
   * Dynamically generate tokens for the given scenario, placing them into this.tokens.
   *
   * @param scenario The scenario for which to generate tokens.
   */
  private generateTokens(scenario: string, seed: number) {
    if (!this.mapNodes || this.mapNodes.length < 1) { return; }
    this.rand = this.seedrandom(seed);
    switch (scenario) {
      case `Smoke & Mirrors`:
      case `Fool's Gold`:
        while (!this.generateFGSaMTokens()) { ; }
        break;
      case `Loot`:
        while (!this.generateLootTokens()) { ; }
        break;
      case `Pillage`:
        while (!this.generatePillageTokens()) { ; }
        break;
      case `Plunder`:
        while (!this.generatePlunderTokens()) { ; }
        break;
      case `Push`:
        while (!this.generatePushTokens()) { ; }
        break;
      case `Raze`:
        while (!this.generateRazeTokens()) { ; }
        break;
      case `Salt the Earth`:
        while (!this.generateStETokens()) { ; }
        break;

      default:
        this.tokens = [];
        break;
    }
  }

  /**
   * Print the given array of tokens to the 'tokenViewer' canvas.
   *
   * @param tokens Array of tokens to print.
   * @param w Width of the map to be printed.
   * @param h Height of the map to be printed.
   * @param debugLevel [Optional] Int representing level of debug information to display;
   * 0 (default, no information) |
   * 1 (Blocking terrain radius) |
   * 2 (Blocking terrain + Token distancing radius)
   */
  private async printTokens(tokens: Token[], w: number, h: number, debugLevel = 0) {
    const generatePrimary = this.isPlunder;
    this.clearTokens();
    if (!tokens || tokens.length === 0) { return; } // if there aren't any tokens to print, don't bother trying

    let canvas = document.getElementById('tokenViewer') as HTMLCanvasElement;
    if (!canvas) {
      while (!canvas) {
        // sometimes the canvas takes a bit to load in
        console.debug('[DynamicTokens] Looking for canvas "tokenViewer"...');
        canvas = document.getElementById('tokenViewer') as HTMLCanvasElement;
        await sleep(150);
      }
      console.debug('[DynamicTokens] Found canvas!');
    }
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (!this.showMapComponent.showWidth) {
      while (!this.showMapComponent.showWidth) {
        // showWidth takes a moment to load when page refreshes
        console.debug('[DynamicTokens] Looking for showWidth...');
        await sleep(150);
      }
      console.debug('[DynamicTokens] Found showWidth!');
    }
    const width = this.showMapComponent.showWidth.nativeElement.offsetWidth;
    ctx.canvas.width = width;
    ctx.canvas.height = width * .66;
    ctx.scale(width / w, width * .66 / h);
    const primary1 = Math.floor(tokens.length*this.rand());
    let primary2 = Math.floor(tokens.length*this.rand());
    while(primary1 === primary2) {
      primary2 = Math.floor(this.tokens.length*this.rand());
    }
    let i = 0;
    for (const t of tokens) {
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.arc(t.x, t.y, 4.1, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = '#cab9a5';
      if(generatePrimary && (i === primary1 || i === primary2)) {
        ctx.fillStyle =  '#800000';
      }
      ctx.fill();

      if (debugLevel) {
        ctx.strokeStyle = 'red';
        ctx.beginPath();
        ctx.arc(t.x, t.y, 25, 0, 2 * Math.PI);
        ctx.stroke();
        if (debugLevel > 1) {
          ctx.strokeStyle = 'black';
          ctx.beginPath();
          ctx.arc(t.x, t.y, 100, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
      i++;
    }
  }

  /**
   * Check whether the given token's placement conflicts with any Blocking terrain.
   *
   * @param token Token to check collisions against.
   * @returns The first map node within collision distance of the given token, or null if no collisions occur.
   */
  private checkMapCollisions(token: Token): Node {
    for (const node of this.mapNodes) {
      if (node.item.type !== TerrainPiece.Type.blocking) { continue; }
      if (dist(token.x, token.y, node.x, node.y) < (25 + node.item.radius)) {
        return node;
      }
    }
    return null;
  }

  /**
   * Check whether the given token's placement conflicts with any other tokens.
   *
   * @param token Token to check collisions against.
   * @param otherTokens Array of other tokens used to check valid token placement (should not include the token to check).
   * @returns The first token within collision distance of the given token, or null if no collisions occur.
   */
  private checkTokenCollisions(token: Token, otherTokens: Token[]): Token {
    for (const t of otherTokens) {
      if (dist(token.x, token.y, t.x, t.y) < 100) {
        return t;
      }
    }
    return null;
  }

  /**
   * Reposition the given token along the x-axis so it is as close to the original position as possible
   * without conflicting with any Blocking terrain. This function should mainly be used for exact center tokens;
   *
   * @param token Token to reposition.
   * @returns New Token with corrected position.
   */
  private repositionTokenX(token: Token): Token {
    let xLeft = token.x;
    let xRight = token.x;
    while (this.checkMapCollisions(new Token(xLeft, token.y)) && xLeft > 25) {
      xLeft--; // find the closest valid position to the left
    }
    while (this.checkMapCollisions(new Token(xRight, token.y)) && xRight < this.width - 25) {
      xRight++; // find the closest valid position to the right
    }
    // pick the closer value between the left and right positions
    token.x = (token.x - xLeft < xRight - token.x) ? xLeft : xRight;
    return token;
  }

  // Scenario Generation functions ------------------------------------------------------

  /**
   * Clear the list of tokens and try to generate placements for the 'Fool's Gold' and 'Smoke & Mirrors' scenarios.
   *
   * @returns Boolean describing whether tokens were placed successfully.
   */
  private generateFGSaMTokens(): boolean {
    this.tokens = [];
    const spacing = 25;
      for (let i = 0; i < 10; i++) {
        const alternateSide = (n: number) => (i % 2 === 0) ? n : (n + (this.height / 2));
        let t: Token;
        let ctr = 0;
        do {
          ctr++;
          if (ctr > this.maxAttempts) {
            // This token arrangement does not allow all tokens to be used.
            console.warn('[DynamicTokens] Warn: MaxAttempts exceeded trying to place token ' + (i + 1));
            return false;
          }
          t = new Token(((this.rand() * (this.width - spacing * 2)) + spacing),
                          alternateSide((this.rand() * (this.height / 2 - spacing * 2)) + spacing));
        } while (this.checkTokenCollisions(t, this.tokens) || this.checkMapCollisions(t));
        this.tokens.push(t);
      }
      return true;
  }

  /**
   * Clear the list of tokens and try to generate placements for the 'Loot' scenario.
   *
   * @returns Boolean describing whether tokens were placed successfully.
   */
  private generateLootTokens(): boolean {
    this.tokens = [];
    let t = new Token(this.width / 2, this.height / 2);
    this.tokens.push(this.repositionTokenX(t));
    for (let i = 0; i < 2; i++) {
      const y = this.height / 2;
      let ctr = 0;
      do {
        ctr++;
        if (ctr > this.maxAttempts) {
          // This token arrangement does not allow all tokens to be used.
          console.warn('[DynamicTokens] Warn: MaxAttempts exceeded trying to place token ' + (i + 1));
          return false;
        }
        t = new Token(this.rand() * (this.width - 50) + 25, y);
      } while (this.checkTokenCollisions(t, this.tokens) || this.checkMapCollisions(t));
      this.tokens.push(t);
    }
    return true;
  }

  /**
   * Clear the list of tokens and try to generate placements for the 'Pillage' scenario.
   *
   * @returns Boolean describing whether tokens were placed successfully.
   */
   private generatePillageTokens(): boolean {
    this.tokens = [];
    const square = false;
    const numTokens = square ? (Math.floor(this.rand()*3+1))+2 : (Math.floor(this.rand()*3+1))+4;
    let t = new Token(this.width / 2, this.height / 2);
    for(let i = 0; i < numTokens; i++) {
      let ctr = 0;
      do {
        ctr++;
        if (ctr > this.maxAttempts) {
          // This token arrangement does not allow all tokens to be used.
          console.warn('[DynamicTokens] Warn: MaxAttempts exceeded trying to place token ' + (i + 1));
          return false;
        }
        t = new Token(this.rand() * (this.width - 50) + 25, this.rand()*(this.height-50)+25);
      } while (this.checkTokenCollisions(t, this.tokens) || this.checkMapCollisions(t));
      this.tokens.push(t);
    }
    return true;
  }

  /**
   * Clear the list of tokens and try to generate placements for the 'Plunder' scenario.
   *
   * @returns Boolean describing whether tokens were placed successfully.
   */
  private generatePlunderTokens(): boolean {
    this.tokens = [];
    for(let i = 1; i<6; i++) {;
      let t = new Token(i*this.width/6, this.height / 2);
      t = this.repositionTokenX(t);
      let ctr = 0;
      while(ctr < 100 && this.checkTokenCollisions(t, this.tokens) || this.checkMapCollisions(t)) {
        t = new Token(t.x+1, t.y);
        ctr++;
      }
      this.tokens.push(t);
    }
    this.isPlunder = true;
    return true;
  }

  /**
   * Clear the list of tokens and try to generate placements for the 'Push' scenario.
   *
   * @returns Boolean describing whether tokens were placed successfully.
   */
   private generatePushTokens(): boolean {
    this.tokens = [];
    const markers = Math.floor(this.rand()*3+1)*2;
    let t = new Token(this.width / 2, this.height / 2);
    this.tokens.push(this.repositionTokenX(t));
    for(let i = 0; i<markers ; i++) {
      const y = (i % 2 === 0) ? (Math.floor(this.rand()*(this.height/4-25)+25)) :
      (Math.floor(this.rand()*(this.height/4-25)+3*this.height/4));
      let ctr = 0;
      do {
        ctr++;
        if (ctr > this.maxAttempts) {
          // This token arrangement does not allow all tokens to be used.
          console.warn('[DynamicTokens] Warn: MaxAttempts exceeded trying to place token ' + (i + 1));
          return false;
        }
        t = new Token(this.rand()* (this.width - 50) + 25, y);
      } while (this.checkTokenCollisions(t, this.tokens) || this.checkMapCollisions(t));
      this.tokens.push(t);
    }
    return true;
  }

  /**
   * Clear the list of tokens and try to generate placements for the 'Raze' scenario.
   *
   * @returns Boolean describing whether tokens were placed successfully.
   */
  private generateRazeTokens(): boolean {
    this.tokens = [];
    // 1 center token
    let t = new Token(this.width / 2, this.height / 2);
    this.tokens.push(this.repositionTokenX(t));
    // 6 side tokens
    for (let i = 0; i < 6; i++) {
      const y = this.height / 2 + 50 * (i % 2 === 0 ? 1 : -1); // 3 tokens on each side
      let ctr = 0;
      do {
        ctr++;
        if (ctr > this.maxAttempts) {
          // This token arrangement does not allow all tokens to be used.
          console.warn('[DynamicTokens] Warn: MaxAttempts exceeded trying to place token ' + (i + 1));
          return false;
        }
        t = new Token(this.rand() * (this.width - 50) + 25, y);
      } while (this.checkTokenCollisions(t, this.tokens) || this.checkMapCollisions(t));
      this.tokens.push(t);
    }
    return true;
  }

  /**
   * Clear the list of tokens and try to generate placements for the 'Salt the Earth' scenario.
   *
   * @returns Boolean describing whether tokens were placed successfully.
   */
  private generateStETokens(): boolean {
    this.tokens = [];
    // TODO add placement functionality
    return true;
  }
}

export class Token {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return 'Token(' + this.x + ', ' + this.y + ')';
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
