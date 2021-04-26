import { Injectable } from '@angular/core';
import { TerrainPiece } from '../dynamic-map/dynamic-map';

@Injectable({
  providedIn: 'root'
})
export class GeneratorSettingsService {
  public useEDMaps = true;
  public hillNotInZones = true;
  public useUserTerrain = false;
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

  toggleUserTerrainSettings(){
    this.useUserTerrain = !this.useUserTerrain;
    if(this.useUserTerrain){
      this.resources = [3, 3, 2, 2];
    }else{
      this.resources = [];
    }
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
    this.useUserTerrain = false;
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

    const userTerrainSwitch = document.getElementById('switchTerrain') as HTMLInputElement;
    userTerrainSwitch.checked = this.useUserTerrain;
    if(this.useUserTerrain){
      const rangeBlocking = document.getElementById('rangeBlocking') as HTMLInputElement;
      rangeBlocking.valueAsNumber = this.resources[0];
      const rangeDifficult = document.getElementById('rangeDifficult') as HTMLInputElement;
      rangeDifficult.valueAsNumber = this.resources[1];
      const rangeObstacle = document.getElementById('rangeObstacle') as HTMLInputElement;
      rangeObstacle.valueAsNumber = this.resources[2];
      const rangeHill = document.getElementById('rangeHill') as HTMLInputElement;
      rangeHill.valueAsNumber = this.resources[3];
      const rangeForest = document.getElementById('rangeForest') as HTMLInputElement;
      rangeForest.valueAsNumber = this.resources[4];
    }
  }

  /**
   * This function takes value of the slider and assigns the value in resources
   */
  setResourcesFromSliders(){
    const rangeBlocking = document.getElementById('rangeBlocking') as HTMLInputElement;
    this.resources[0] = rangeBlocking.valueAsNumber;
    const rangeDifficult = document.getElementById('rangeDifficult') as HTMLInputElement;
    this.resources[1] = rangeDifficult.valueAsNumber;
    const rangeObstacle = document.getElementById('rangeObstacle') as HTMLInputElement;
    this.resources[2] = rangeObstacle.valueAsNumber;
    const rangeHill = document.getElementById('rangeHill') as HTMLInputElement;
    this.resources[3] = rangeHill.valueAsNumber;
    const rangeForest = document.getElementById('rangeForest') as HTMLInputElement;
    this.resources[4] = rangeForest.valueAsNumber;
  }

}

