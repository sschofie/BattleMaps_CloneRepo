/* eslint-disable @typescript-eslint/dot-notation */

import { GeneratorSettingsService } from '../collapse-basic/generator-settings.service';
import { DynamicMap, dist, TerrainPiece, Node } from '../dynamic-map/dynamic-map';
import { ShowMapComponent } from '../show-map/show-map.component';
import { DynamicTokens, Token } from './dynamic-tokens';

describe('DynamicTokens', () => {
  it('should create an instance', () => {
    expect(new DynamicTokens()).toBeTruthy();
  });

  describe('isValidSeed', () => {
    it('should ensure seed is within bounds', () => {
      // test out of bounds returns false
      expect(DynamicTokens.isValidSeed(NaN)).toBe(false,
        'NaN should not be considered valid.');
      expect(DynamicTokens.isValidSeed(-1)).toBe(false,
        '-1 should not be considered valid.');
      expect(DynamicTokens.isValidSeed(0)).toBe(false,
        '0 should not be considered valid.');
      expect(DynamicTokens.isValidSeed(DynamicTokens.maxInt32Unsigned)).toBe(false,
        DynamicTokens.maxInt32Unsigned + ' should not be considered valid.');
      // test in bounds returns true
      expect(DynamicTokens.isValidSeed(1)).toBe(true,
        '1 should be considered valid.');
      expect(DynamicTokens.isValidSeed(DynamicTokens.maxInt32Unsigned / 2)).toBe(true,
        (DynamicTokens.maxInt32Unsigned / 2) + ' should be considered valid.');
      expect(DynamicTokens.isValidSeed(DynamicTokens.maxInt32Unsigned - 1)).toBe(true,
        (DynamicTokens.maxInt32Unsigned - 1) + ' should be considered valid.');
    });
  });

  describe('newSeed', () => {
    it('should return valid seed', () => {
      for (let i = 0; i < 100; i++) {
        expect(DynamicTokens.isValidSeed(DynamicTokens.newSeed())).toBeTrue();
      }
    });

    it('should return distinct seeds', () => {
      let oldSeed: number;
      let nMatches = 0;
      for (let i = 0; i < 100; i++) {
        const newSeed = DynamicTokens.newSeed();
        if (newSeed === oldSeed) {
          nMatches++;
        }
        oldSeed = newSeed;
      }
      expect(nMatches).toBeLessThan(25);
    });
  });

  describe('clearTokens', () => {
    const dynamicTokens = new DynamicTokens();

    it('should empty list of tokens', () => {
      dynamicTokens['tokens'] = new Array(10).fill(new Token(0, 0));
      expect(dynamicTokens['tokens'].length).toBeGreaterThan(0);
      dynamicTokens.clearTokens();
      expect(dynamicTokens['tokens'].length).toEqual(0);
    });
  });

  describe('generateTokens', () => {
    const dynamicTokens = new DynamicTokens();
    const dynamicMap = new DynamicMap();
    dynamicMap.generatorSettings = new GeneratorSettingsService();
    dynamicTokens['mapNodes'] = dynamicMap['simpleGenerate'](400, 600, 50, null, DynamicMap.newSeed());

    it('should return the same tokens from same seeds', () => {
      const testSeeds = [];
      for (let i = 0; i < 10; i++) {
        testSeeds[i] = Math.floor(Math.random() * DynamicTokens.maxInt32Unsigned);
      }
      for (const scenario of ShowMapComponent.scenarios) {
        for (const seed of testSeeds) {
          dynamicTokens['generateTokens'](scenario, seed);
          const tokens1 = dynamicTokens['tokens'];
          dynamicTokens['generateTokens'](scenario, seed);
          const tokens2 = dynamicTokens['tokens'];
          if (!tokens1) {
            expect(tokens2).not.toBeDefined('Seed that generates no tokens should do so every time.');
          } else {
            for (let i = 0; i < tokens1.length; i++) {
              expect(tokens1[i].x).toEqual(tokens2[i].x);
              expect(tokens1[i].y).toEqual(tokens2[i].y);
            }
          }
        }
      }
    });

    it('should generate tokens at least 3" (25u) from board edges', () => {
      scenarios:
      for (const scenario of ShowMapComponent.scenarios) {
        for (let x = 0; x < 10; x++) { // test multiple generations per scenario
          dynamicTokens['generateTokens'](scenario, DynamicTokens.newSeed());
          const tokens = dynamicTokens['tokens'];
          if (!tokens) { continue scenarios; } // skip this scenario if it doesn't generate tokens
          for (const t of tokens) {
            expect(t.x).toBeGreaterThanOrEqual(25, 'Token out of bounds on x for scenario ' + scenario);
            expect(t.x).toBeLessThanOrEqual(600 - 25, 'Token out of bounds on x for scenario ' + scenario);
            expect(t.y).toBeGreaterThanOrEqual(25, 'Token out of bounds on y for scenario ' + scenario);
            expect(t.y).toBeLessThanOrEqual(400 - 25, 'Token out of bounds on y for scenario ' + scenario);
          }
        }
      }
    });

    it('should generate tokens at least 12" (100u) from each other', () => {
      scenarios:
      for (const scenario of ShowMapComponent.scenarios) {
        for (let x = 0; x < 10; x++) { // test multiple generations per scenario
          dynamicTokens['generateTokens'](scenario, DynamicTokens.newSeed());
          const tokens = dynamicTokens['tokens'];
          if (!tokens) { continue scenarios; } // skip this scenario if it doesn't generate tokens
          for (const t of tokens) {
            for (const other of tokens) {
              if (other !== t) { // make sure we don't check the token against itself
                expect(dist(t.x, t.y, other.x, other.y)).toBeGreaterThanOrEqual(100,
                  'Tokens too close together for scenario ' + scenario);
              }
            }
          }
        }
      }
    });

    it('should generate tokens at least 3" (25u) from blocking terrain', () => {
      scenarios:
      for (const scenario of ShowMapComponent.scenarios) {
        for (let x = 0; x < 10; x++) { // test multiple maps per scenario
          dynamicTokens['mapNodes'] = dynamicMap['simpleGenerate'](400, 600, 50, null, DynamicMap.newSeed());
          dynamicTokens['generateTokens'](scenario, DynamicTokens.newSeed());
          const tokens = dynamicTokens['tokens'];
          if (!tokens) { continue scenarios; } // skip this scenario if it doesn't generate tokens
          for (const t of tokens) {
            for (const node of dynamicTokens['mapNodes']) {
              if (node.item.type === TerrainPiece.Type.blocking) { // make sure we don't check the token against itself
                expect(dist(t.x, t.y, node.x, node.y)).toBeGreaterThanOrEqual(25 + node.item.radius,
                  'Token too close to blocking terrain for scenario ' + scenario);
              }
            }
          }
        }
      }
    });
  });

  describe('checkMapCollisions', () => {
    const dynamicTokens = new DynamicTokens();
    const blockingPiece = DynamicMap.terrainPieces[4][1]; // boulder
    const blockingNode = new Node(0, 0, null, null, blockingPiece, null);
    const nonBlockingPiece = DynamicMap.terrainPieces[3][1]; // tree
    const nonBlockingNode = new Node(10, 10, null, null, nonBlockingPiece, null);

    it('should return null if given token is at least 3" (25u) from all blocking terrain', () => {
      dynamicTokens['mapNodes'] = [blockingNode, nonBlockingNode];
      // test at 3"
      let collision = dynamicTokens['checkMapCollisions'](new Token(0, blockingPiece.radius + 25));
      expect(collision).toEqual(null, 'Token at 3" should not return a collision');
      // test just under 3"
      collision = dynamicTokens['checkMapCollisions'](new Token(0, blockingPiece.radius + 24));
      expect(collision).not.toEqual(null, 'Token less than 3" should return a collision');
      // test way over 3"
      collision = dynamicTokens['checkMapCollisions'](new Token(0, blockingPiece.radius + 50));
      expect(collision).toEqual(null, 'Token more than 3" should not return a collision');
    });

    it('should return first colliding blocking terrain node if token is less than 3" (25u) from blocking terrain', () => {
      dynamicTokens['mapNodes'] = [blockingNode, nonBlockingNode];
      const collision = dynamicTokens['checkMapCollisions'](new Token(0, 10));
      expect(collision).toEqual(blockingNode, 'Did not return correct node');
    });
  });

  describe('checkTokenCollisions', () => {
    const dynamicTokens = new DynamicTokens();

    it('should return null if given token is at least 12" (100u) from all other tokens', () => {
      const tokens = Array(10).fill(new Token(0, 0));
      // test at 12"
      let collision = dynamicTokens['checkTokenCollisions'](new Token(0, 100), tokens);
      expect(collision).toEqual(null, 'Token at 12" should not return a collision');
      // test just under 12"
      collision = dynamicTokens['checkTokenCollisions'](new Token(0, 99), tokens);
      expect(collision).not.toEqual(null, 'Token less than 12" should return a collision');
      // test way over 12"
      collision = dynamicTokens['checkTokenCollisions'](new Token(0, 200), tokens);
      expect(collision).toEqual(null, 'Token more than 12" should not return a collision');
    });

    it('should return first colliding token if token is less than 12" (100u) from another token', () => {
      const token1 = new Token(0, 0);
      const tokens = [token1].concat(Array(10).fill(new Token(0, Math.random() * 600)));
      const collision = dynamicTokens['checkTokenCollisions'](new Token(0, 10), tokens);
      expect(collision).toEqual(token1, 'Did not return correct token');
    });
  });
});
