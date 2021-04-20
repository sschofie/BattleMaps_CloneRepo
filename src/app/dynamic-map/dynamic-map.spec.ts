import { NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { GeneratorSettingsService } from '../collapse-basic/generator-settings.service';
import { ShowMapComponent } from '../show-map/show-map.component';
import { DynamicMap, Node, TerrainPiece } from './dynamic-map';

describe('DynamicMap', () => {
  it('should create an instance', () => {
    expect(new DynamicMap()).toBeTruthy();
  });

  describe('isValidSeed', () => {
    it('should ensure seed is within bounds', () => {
      // test out of bounds returns false
      expect(DynamicMap.isValidSeed(NaN)).toBeFalse();
      expect(DynamicMap.isValidSeed(-1)).toBeFalse();
      expect(DynamicMap.isValidSeed(0)).toBeFalse();
      expect(DynamicMap.isValidSeed(DynamicMap.maxInt32Unsigned)).toBeFalse();
      // test in bounds returns true
      expect(DynamicMap.isValidSeed(1)).toBeTrue();
      expect(DynamicMap.isValidSeed(DynamicMap.maxInt32Unsigned / 2)).toBeTrue();
      expect(DynamicMap.isValidSeed(DynamicMap.maxInt32Unsigned - 1)).toBeTrue();
    });
  });

  describe('newSeed', () => {
    it('should return valid seed', () => {
      for (let i = 0; i < 100; i++) {
        expect(DynamicMap.isValidSeed(DynamicMap.newSeed())).toBeTrue();
      }
    });

    it('should return distinct seeds', () => {
      let oldSeed: number;
      let nMatches = 0;
      for (let i = 0; i < 100; i++) {
        const newSeed = DynamicMap.newSeed();
        if (newSeed === oldSeed) {
          nMatches++;
        }
        oldSeed = newSeed;
      }
      expect(nMatches).toBeLessThan(25);
    });
  });

  describe('simpleGenerate', () => {
    const dynamicMap = new DynamicMap();
    const gen = 'simpleGenerate';

    beforeEach(() => {
      dynamicMap.generatorSettings = new GeneratorSettingsService();
    });

    it('should return a non-empty map', () => {
      const seed = Math.floor(Math.random() * DynamicMap.maxInt32Unsigned);
      const map = dynamicMap[gen](400, 600, 50, false, seed);
      expect(map.length).toBeGreaterThanOrEqual(1);
    });

    it('should return the same maps from same test seeds', () => {
      const testSeed1 = 0;
      const testSeed2 = DynamicMap.maxInt32Unsigned / 2;
      const testSeed3 = DynamicMap.maxInt32Unsigned;
      const testSeeds = [testSeed1, testSeed2, testSeed3];
      for (const seed of testSeeds) {
        const map1 = dynamicMap[gen](400, 600, 50, false, seed);
        const map2 = dynamicMap[gen](400, 600, 50, false, seed);
        for (let i = 0; i < map1.length; i++) {
          expect(map1[i].angle).toEqual(map2[i].angle);
          expect(map1[i].x).toEqual(map2[i].x);
          expect(map1[i].y).toEqual(map2[i].y);
          expect(map1[i].radius).toEqual(map2[i].radius);
          expect(map1[i].item).toEqual(map2[i].item);
        }
      }
    });

    it('should return the same maps from same random seeds', () => {
      const testSeeds = [];
      for (let i = 0; i < 10; i++) {
        testSeeds[i] = Math.floor(Math.random() * DynamicMap.maxInt32Unsigned);
      }
      for (const seed of testSeeds) {
        const map1 = dynamicMap[gen](400, 600, 50, false, seed);
        const map2 = dynamicMap[gen](400, 600, 50, false, seed);
        for (let i = 0; i < map1.length; i++) {
          expect(map1[i].angle).toEqual(map2[i].angle);
          expect(map1[i].x).toEqual(map2[i].x);
          expect(map1[i].y).toEqual(map2[i].y);
          expect(map1[i].radius).toEqual(map2[i].radius);
          expect(map1[i].item).toEqual(map2[i].item);
        }
      }
    });

    it('should generate nodes within the boundary limit', () => {
      const seed = Math.floor(Math.random() * DynamicMap.maxInt32Unsigned);
      const setLimit = 50;
      const hillLimit = 100;
      const randomLimit = Math.floor(Math.random()*100);
      let map = dynamicMap[gen](400, 600, setLimit, false, seed);
      for (const m of map) {
        expect(m.x).toBeGreaterThanOrEqual(setLimit, 'Piece out of bounds on x');
        expect(m.x).toBeLessThanOrEqual(600 - setLimit, 'Piece out of bounds on x');
        if(m.item.type === TerrainPiece.Type.hill) {
          expect(m.y).toBeGreaterThanOrEqual(hillLimit, 'Hill out of bounds on y');
          expect(m.y).toBeLessThanOrEqual(400 - hillLimit, 'Hill out of bounds on y');
        } else {
          expect(m.y).toBeGreaterThanOrEqual(setLimit, 'Piece out of bounds on y');
          expect(m.y).toBeLessThanOrEqual(400 - setLimit, 'Piece out of bounds on y');
        }
      }
      for (let x = 0; x < 10; x++) { //tests multiple times to check for out of bounds generations.
        map = dynamicMap[gen](400, 600, randomLimit, false, seed);
        for (const m of map) {
          expect(m.x).toBeGreaterThanOrEqual(randomLimit, 'Piece out of bounds on x');
          expect(m.x).toBeLessThanOrEqual(600 - randomLimit, 'Piece out of bounds on x');
          if(m.item.type === TerrainPiece.Type.hill) {
            expect(m.y).toBeGreaterThanOrEqual(hillLimit, 'Hill out of bounds on y');
            expect(m.y).toBeLessThanOrEqual(400 - hillLimit, 'Hill out of bounds on y');
          } else {
            expect(m.y).toBeGreaterThanOrEqual(randomLimit, 'Piece out of bounds on y');
            expect(m.y).toBeLessThanOrEqual(400 - randomLimit, 'Piece out of bounds on y');
          }
        }
      }
    });

    it('should generate map with limited resources', () => {
      const seed = DynamicMap.newSeed();
      dynamicMap.generatorSettings.resources = [3, 0, 3, 0, 0];
      let map = dynamicMap[gen](400, 600, 50, false, seed);
      expect(map.length).toBe(6, 'Incorrect number of pieces');
      for (const node of map) {
        expect([TerrainPiece.Type.blocking, TerrainPiece.Type.obstacle]).toContain(node.item.type, 'Incorrect item Type');
      }

      const numTypes = Object.keys(TerrainPiece.Type).length / 2;
      dynamicMap.generatorSettings.resources = new Array(numTypes).fill(0);
      for (let i = 0; i < numTypes; i++) {
        dynamicMap.generatorSettings.resources[Math.floor(Math.random() * numTypes)] += 1;
      }
      map = dynamicMap[gen](400, 600, 50, false, seed);
      expect(map.length).toBeLessThanOrEqual(numTypes, 'Too many pieces');
      //checks to see if resource limit was exceeded
      for (let i = 0; i < dynamicMap.generatorSettings.resources.length; i++) {
        expect(dynamicMap.generatorSettings.resources[i]).toBeGreaterThan(-1, 'Exceeded limit of item Type: ' +
          TerrainPiece.Type[i] + ' by ' + (-1 * dynamicMap.generatorSettings.resources[i]));
      }
    });

    it('should run validation on resource array', () => {
      // injecting a dummy ShowMapComponent so simpleGenerate has an onLoad() to "call"
      dynamicMap['context'] = // eslint-disable-line @typescript-eslint/dot-notation
        new ShowMapComponent(null, null, null, null, null, null, new GeneratorSettingsService(), null, new NgbTooltipConfig(null));

      const seed = DynamicMap.newSeed();
      // test shorter resource array
      dynamicMap.generatorSettings.resources = [1, 2, 3];
      let map = dynamicMap[gen](400, 600, 50, false, seed);
      expect(map.length).toEqual(6, 'Incorrect number of pieces');

      // test longer resource array
      dynamicMap.generatorSettings.resources = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      map = dynamicMap[gen](400, 600, 50, false, seed);
      expect(map.length).toBeLessThanOrEqual(15, 'Incorrect number of pieces');

      // test resource array of zeroes
      dynamicMap.generatorSettings.resources = new Array(Object.keys(TerrainPiece.Type).length / 2).fill(0);
      map = dynamicMap[gen](400, 600, 50, false, seed);
      expect(map.length).toEqual(0, 'Incorrect number of pieces');
    });

  });
});
