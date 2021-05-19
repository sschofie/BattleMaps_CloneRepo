import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbTooltipConfig } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';
import { ClipboardService } from 'ngx-clipboard';
import { DynamicMap, Node } from '../dynamic-map/dynamic-map';
import { ToastService } from '../toast/toast.service';
import { ToastScenarioInfoService } from '../toast/toast-scenario-info.service';
import { GeneratorSettingsService } from '../collapse-basic/generator-settings.service';
import { MapLegendComponent } from './map-legend/map-legend.component';
import { DynamicTokens } from '../dynamic-tokens/dynamic-tokens';

@Component({
  selector: 'app-show-map',
  templateUrl: './show-map.component.html',
  styleUrls: [
    './show-map.component.css',
    '../../assets/simple-line-icons/css/simple-line-icons.css'
  ],
  providers: [NgbTooltipConfig]
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
    `Raze`,
    `Salt the Earth`,
    `Smoke & Mirrors`
  ];
  @ViewChild('showWidth') showWidth: ElementRef;
  @ViewChild('MapLegendComponent') legend: MapLegendComponent;
  isProduction = environment.production;
  dwarfText = '';
  selectedScenario = '';
  isLongLoading = false;
  currentURL = '';
  showLegend = false;
  legendButton = 'Legend';
  legendViewer: HTMLCanvasElement;
  toggleLegend;
  public mapDisplay: string;
  mapNodes: Node[];
  showTokens = true;
  private baseURL = environment.appURL;
  private changeScenarioOnly = false;
  private isLoading: boolean;
  private tmpDwarfText: string;
  private tmpSelectedScenario: string;




  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NgbModal,
    private clipboardService: ClipboardService,
    private dynamicMap: DynamicMap,
    public toastService: ToastService,
    public toastScenarioInfoService: ToastScenarioInfoService,
    public generatorSettings: GeneratorSettingsService,
    private dynamicTokens: DynamicTokens,
    private config: NgbTooltipConfig
  ) {
    config.openDelay = 500;
    if(dynamicMap !== null) {
      dynamicMap.generatorSettings = generatorSettings;
    }
   }
  ngOnInit() {
    this.startSpinner();
    // update the displayed information whenever the queries are updated
    this.route.queryParams.subscribe(() => {
      // apply the generator settings first, so the map will be created properly
      this.setGeneratorSettingsFromQuery();
      // if setting the scenario fails, pick a new scenario
      if (!this.setScenarioFromQuery()) {
        console.debug('Generating new scenario...');
        this.switchScenario(true);
      }
      // check whether we're only changing the scenario or tokens, then:
      // if setting the map fails, pick a new map
      if (!this.changeScenarioOnly && !this.setMapFromQuery()) {
        console.debug('Generating new map...');
        this.switchMap(true);
      }
      // if setting the tokens fails, pick a new token seed
      if (this.showTokens && !this.setTokensFromQuery()) {
        console.debug('Generating new tokens...');
        this.switchTokens(true);
      }
      this.changeScenarioOnly = false;
    });
    this.showLegend = false;
    this.toggleLegend = document.getElementById('LegendButton') as HTMLInputElement;
    this.toggleLegend.checked = false;
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
    this.router.navigate(['/app'], {
      queryParams: {
        s: this.switchScenario(false),
        t: this.switchTokens(false)
      },
      queryParamsHandling: 'merge'
    });
  }

  /**
   * Called when "Tokens" switch is toggled. Displays tokens if switched on, clears tokens if switched off.
   */
  onTokenSwitchClick() {
    this.showTokens = !this.showTokens;
    if (this.showTokens) {
      this.setTokensFromQuery();
    }
    else {
      this.dynamicTokens.clearTokens();
    }
  }

  /**
   * Pick a random scenario and map and update the URL accordingly.
   */
  switchMapAndScenario() {
    this.router.navigate(['/app'], {
      queryParams: {
        s: this.switchScenario(false),
        map: this.switchMap(false),
        t: this.switchTokens(false),
        settings: this.generatorSettings.settingsParamValue(),
        r: this.generatorSettings.resourcesParamValue()
      }
    });
    this.hideMapLegend();
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
      if (environment.featureFlags.dynamicMaps &&
          (!this.generatorSettings.useEDMaps || Math.random() < 0.75)) { //picks a random maps 75% of the time
        // generate a random seed
        mapID = DynamicMap.newSeed().toString();
      }
      else { //picks ED maps 25% of the time
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
   * Pick a new random token seed.
   *
   * @param navigate Whether to update URL query parameters.
   *
   * @returns New token seed.
   */
  switchTokens(navigate: boolean): number {
    if (!environment.featureFlags.tokens) { return null; }
    let tokenSeed: number;
    const oldTokenSeed = Number(this.route.snapshot.queryParamMap.get('t'));
    tokenSeed = oldTokenSeed;
    while (Number.isNaN(tokenSeed) || tokenSeed === oldTokenSeed) { // make sure we're actually picking a new seed
      tokenSeed = DynamicTokens.newSeed();
    }
    if (navigate) {
      // update the URL with the chosen information
      this.router.navigate(['/app'], { queryParams: { t: tokenSeed }, queryParamsHandling: 'merge' });
    }
    return tokenSeed;
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
    if (!scenarioID) { return false; }
    this.tmpSelectedScenario = ShowMapComponent.scenarios[scenarioID];
    // check that we have a valid scenario
    if (!this.tmpSelectedScenario) { console.warn('WARN: Invalid scenario ID.'); return false; }
    if (this.changeScenarioOnly) {
      this.onLoad();
    }
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
    if (!mapID) { return false; }
    if (mapID.startsWith('ed', 0)) {
      const mapNum = Number(mapID.replace('ed', ''));
      // check that we have a valid map number
      if (isNaN(mapNum) || mapNum < 1 || mapNum > 20) {
        console.warn('WARN: Invalid Epic Dwarf map ID.');
        return false;
      }
      this.mapNodes = this.dynamicMap.printEpicDwarfMap(this, mapNum);
      this.passNodes();
      this.passLegendNodes();
      this.tmpDwarfText = 'Lars\' Epic Dwarf map #' + mapNum;
    }
    else {
      if (!environment.featureFlags.dynamicMaps) {
        // for now we don't want to use maps other than ed
        console.warn('WARN: Invalid map ID (not an Epic Dwarf ID).');
        return false;
      }

      const mapSeed = Number(mapID);
      if (!DynamicMap.isValidSeed(mapSeed)) {
        console.warn('WARN: Map seed is invalid.');
        return false;
      }
      this.mapNodes = this.dynamicMap.generateAndPrintMap(this, mapSeed);
      this.passNodes();
      this.passLegendNodes();
      this.tmpDwarfText = 'Dynamically generated map';
    }
    return true;
  }

  /**
   * Set the tokens based on the current url query parameters.
   *
   * @returns False if token seed is invalid or does not exist.
   */
  setTokensFromQuery(): boolean {
    // load the token seed
    const tokenSeedParam = this.route.snapshot.queryParamMap.get('t');
    // check that the 't' parameter exists
    if (!tokenSeedParam) { return false; }

    const tokenSeed = Number(tokenSeedParam);
    if (!DynamicMap.isValidSeed(tokenSeed)) {
      console.warn('WARN: Token seed is invalid.');
      return false;
    }
    if(!this.dynamicTokens.generateAndPrintTokens(this, this.mapNodes, this.tmpSelectedScenario, tokenSeed)) {
      console.debug('Switching scenario due to token generation failure...');
      this.switchScenario(true);
    }
    return true;
  }

  /**
   * Set the generator settings based on the current url query parameters.
   */
  setGeneratorSettingsFromQuery() {
    // load the settings value
    const settingsParam = this.route.snapshot.queryParamMap.get('settings');
    // load the resources value
    const resParam = this.route.snapshot.queryParamMap.get('r');
    this.generatorSettings.applySettingsFromQuery(settingsParam, resParam);
  }

  /**
   * Sets the QR code string based on the current map, then opens a modal using the given template.
   *
   * @param modal - The modal HTML template.
   */
  openShareModal(modal: TemplateRef<NgbModal>) {
    this.currentURL = this.baseURL + this.router.url;
    this.toastScenarioInfoService.toasts = [];
    this.modalService.open(modal, { ariaLabelledBy: 'shareModalTitle' });
  }

  /**
   * Shares link to current map via mobile OS share menu if available, otherwise copies URL to clipboard.
   */
  shareURL() {
    if (navigator.share) {
      navigator.share({
        url: this.currentURL
      });
    } else {
      this.clipboardService.copy(this.currentURL);
      this.toastService.show('Link copied to clipboard');
    }
  }

  passNodes() {
    return this.mapNodes;
  }
  /*
   * Function to recieve getToolTips() from Tool-Tips Component
   */
  passLegendNodes() {
  }

  /**
   * Function called with switchMapand Scenario to clear Tooltips display
   */
  hideMapLegend() {
    this.toggleLegend = document.getElementById('LegendButton') as HTMLInputElement;
    this.showLegend = false;
    this.toggleLegend.checked = false;
  }

  /*
   * Function to get Tooltips from ToolTipsComponent
   */
  toggleMapLegend() {
    this.showLegend = !this.showLegend;
    if (this.showLegend) {
      this.passNodes();
      this.passLegendNodes();
    }
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
