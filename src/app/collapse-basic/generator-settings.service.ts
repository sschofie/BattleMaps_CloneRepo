import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeneratorSettingsService {
  public useEDMaps = true;
  public hillNotInZones = true;

  constructor() { }

  toggleUseEDMaps() {
    this.useEDMaps = !this.useEDMaps;
  }

  toggleHillSettings() {
    this.hillNotInZones = !this.hillNotInZones;
  }
}
