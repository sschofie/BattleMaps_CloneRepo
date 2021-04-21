import { Injectable } from '@angular/core';
import { TerrainPiece } from '../dynamic-map/dynamic-map';

@Injectable({
  providedIn: 'root'
})
export class GeneratorSettingsService {
  public useEDMaps = true;
  public hillNotInZones = true;
  /**
   * Array representing the available quantity of each resource type.
   * Set value to `[]` to remove resource restrictions.
   *
   * Order: `numBlocking, numDifficult, numObstacle, numHill, numForest`
   */
  public resources: number[] = [];

  constructor() { }

  toggleUseEDMaps() {
    this.useEDMaps = !this.useEDMaps;
  }

  toggleHillSettings() {
    this.hillNotInZones = !this.hillNotInZones;
  }

  /**
   * Set the generator settings based on the given parametes.
   *
   * @param settingsParam - Comma-separated string representing the generator settings.
   * 0 is interpreted as `false`, any other value as `true`.
   * TODO Format: `hillNotInZones,mirrorMaps,lanes`
   *
   * @param resourcesParam - Comma-separated string representing the available resources,
   * where each value represents the quantity of that resource type.
   * Format: `numBlocking,numDifficult,numObstacle,numHill,numForest`
   */
  applySettingsFromQuery(settingsParam: string, resourcesParam: string) {
    // check that a value for the parameter exists
    if (settingsParam) {
      const settings = settingsParam.split(',').map(x => Number(x) !== 0);
      this.hillNotInZones = settings[0];
      // TODO set mirroring setting
      // TODO set lanes setting
    } else {
      console.debug('[GeneratorSettings] Settings not provided.');
      this.restoreDefaults();
    }

    // check that a value for the parameter exists
    if (resourcesParam) {
      this.resources = resourcesParam.split(',').map(x => +x);
      // discard extra values if the resources array is longer than list of terrain types
      this.resources = this.resources.slice(0, Object.keys(TerrainPiece.Type).length / 2);
    } else {
      console.debug('[GeneratorSettings] Resources not provided.');
      this.resources = [];
    }
    this.setSwitches();
  }

  /**
   * Compile all current generator setting values into a comma-separated string,
   * where 0 represents `false` and 1 represents `true`.
   *
   * @returns String param value.
   */
  settingsParamValue(): string {
    let settings = [];
    settings = settings.concat(this.hillNotInZones);
    // TODO add mirroring setting
    // TODO add lanes setting
    return settings.map(x => x ? 1 : 0).join(',');
  }

  /**
   * Compile the resources array into a comma separated string,
   * where each value represents the quantity of that resource type.
   *
   * @returns String param value in order of: Blocking, Difficult, Obstacle, Hill, Forest
   */
  resourcesParamValue(): string {
    return this.resources.join(',');
  }

  /**
   * Restore all settings to the default value.
   */
  restoreDefaults() {
    this.useEDMaps = true;
    this.hillNotInZones = true;
    this.resources = [];
    this.setSwitches();
  }

  /**
   * Set all corresponding UI elements to reflect the current settings values.
   */
  setSwitches() {
    const useEDMapsSwitch = document.getElementById('switchED') as HTMLInputElement;
    useEDMapsSwitch.checked = this.useEDMaps;

    const hillNotInZonesSwitch = document.getElementById('switchHills') as HTMLInputElement;
    hillNotInZonesSwitch.checked = this.hillNotInZones;

    // TODO set mirroring switch

    // TODO set lanes switch

    // TODO set resources sliders
    const numBlocking = document.getElementById('rangeBlocking') as HTMLInputElement;
    this.resources.splice(0, 1, numBlocking.valueAsNumber);
    const numDifficult = document.getElementById('rangeDifficult') as HTMLInputElement;
    this.resources.splice(1, 1, numDifficult.valueAsNumber);
    const numObstacle = document.getElementById('rangeObstacle') as HTMLInputElement;
    this.resources.splice(2, 1, numObstacle.valueAsNumber);
    const numHill = document.getElementById('rangeHill') as HTMLInputElement;
    this.resources.splice(3, 1, numHill.valueAsNumber);
    const numForest = document.getElementById('rangeForest') as HTMLInputElement;
    this.resources.splice(4, 1, numForest.valueAsNumber);
  }

  /**
   * This function takes the string id of the span label and the value of the slider
   */
  doSlider(labelstr, val){
    const output = document.getElementById(labelstr) as HTMLInputElement;
    output.textContent = val;
    this.setSwitches();
  }
}

