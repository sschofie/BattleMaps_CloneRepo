import { DynamicMap } from './dynamic-map';

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

  // Here is an example for how to test private methods:

  // it('should do a thing', () => {
  //   const dynamicMap = new DynamicMap();
  //   const simpleGenerate = spyOn<any>(dynamicMap, 'simpleGenerate'); // add <any> to avoid errors
  //   expect(simpleGenerate).not.toHaveBeenCalled();
  //   dynamicMap['simpleGenerate'](400, 600, 50, null, false, DynamicMap.maxInt32Unsigned); // use ['<methodName'](args) instead
  //   expect(simpleGenerate).toHaveBeenCalled();
  // });
});
