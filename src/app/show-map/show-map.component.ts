import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-show-map',
  templateUrl: './show-map.component.html',
  styleUrls: [
    './show-map.component.css',
    '../../assets/simple-line-icons/css/simple-line-icons.css'
  ]
})

export class ShowMapComponent implements OnInit {
  mapDisplay = '';
  dwarfText = '';
  selectedScenario = '';
  isLongLoading = false;
  qrCodeString = '';
  private baseURL = environment.appURL;
  private isLoading: boolean;
  private tmpDwarfText: string;
  private tmpSelectedScenario: string;
  private scenarios = [
    `Control`,
    `Dominate`,
    `Fool's Gold`,
    `Invade`,
    `Kill`,
    `Loot`,
    `Pillage`,
    `Plunder`,
    `Push`,
    `Salt the Earth`,
    `Smoke & Mirrors`
  ];

  constructor(private route: ActivatedRoute, private router: Router, private modalService: NgbModal) { }

  ngOnInit() {
    // update the displayed information whenever the queries are updated
    this.route.queryParams.subscribe(() => {
      this.startSpinner();
      // if setting the scenario fails, pick a new scenario
      if (!this.setScenarioFromQuery()) {
        this.switchScenario(true);
      }
      // if setting the map fails, pick a new map
      if (!this.setMapFromQuery()) {
        this.switchMap(true);
      }
    });
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
   * Pick a random scenario and map and update the URL accordingly.
   */
  switchMapAndScenario() {
    this.router.navigate(['/app'], {
      queryParams: {
        s: this.switchScenario(false),
        map: this.switchMap(false)
      }
    });
  }

  /**
   * Pick a new random scenario ID.
   *
   * @param navigate Whether to update URL query parameters.
   *
   * @returns New scenario ID.
   */
  switchScenario(navigate: boolean): number {
    const scenarioID = Math.floor(Math.random() * this.scenarios.length);
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
    const mapCount = 20;
    const mapID = 'ed' + (Math.round(Math.random() * (mapCount - 1)) + 1);
    if (navigate) {
      // update the URL with the chosen information
      this.router.navigate(['/app'], { queryParams: { map: mapID }, queryParamsHandling: 'merge' });
    }
    return mapID;
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
    this.tmpSelectedScenario = this.scenarios[scenarioID];
    // check that we have a valid scenario
    if (!this.tmpSelectedScenario) { return false; }
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
      if (isNaN(mapNum) || mapNum < 1 || mapNum > 20) { return false; }
      this.mapDisplay = 'assets/img/maps/' + mapID + '.svg';
      this.tmpDwarfText = 'Lars\' Epic Dwarf map #' + mapNum;
    }
    else {
      // for now, any map ID that doesn't start with 'ed' (e.g. any map that isn't epic dwarf) is invalid
      return false;
    }
    return true;
  }

  /**
   * Sets the QR code string based on the current map, then opens a modal using the given template.
   *
   * @param modal - The modal HTML template.
   */
  openShareModal(modal: TemplateRef<NgbModal>) {
    this.qrCodeString = this.baseURL + this.router.url;
    this.modalService.open(modal, { ariaLabelledBy: 'shareModalTitle' });
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
