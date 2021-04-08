import { Component } from '@angular/core';
import { GeneratorSettingsService } from './generator-settings.service';

@Component({
  selector: 'app-ngbd-collapse-basic',
  templateUrl: 'settings-menu.html'
})
export class CollapseBasicComponent {
  public isCollapsed = true;

  constructor(
    public generatorSettings: GeneratorSettingsService) { }
}
