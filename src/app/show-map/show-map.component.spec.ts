import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { QRCodeModule } from 'angularx-qrcode';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DynamicMap } from '../dynamic-map/dynamic-map';
import { MapGeneratorPageComponent } from '../map-generator-page/map-generator-page.component';
import { ToastComponent } from '../toast/toast.component';

import { ShowMapComponent } from './show-map.component';

describe('ShowMapComponent', () => {
  const baseTestBed = {
    declarations: [
      ShowMapComponent,
      ToastComponent
    ],
    imports: [
      RouterTestingModule.withRoutes(
        [{ path: 'app', component: MapGeneratorPageComponent }]
      ),
      NgbTooltipModule,
      QRCodeModule
    ],
    providers: [
      DynamicMap,
      {
        provide: ActivatedRoute,
        useValue: {
          queryParams: of({}),
          snapshot: {
            queryParamMap: {
              get: () => undefined
            }
          }
        }
      },
      {
        provide: Router,
        useValue: {
          navigate: jasmine.createSpy('navigate')
        }
      }
    ]
  };
  let component: ShowMapComponent;
  let fixture: ComponentFixture<ShowMapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule(baseTestBed).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowMapComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set scenario and map from queries on init ', () => {
    const setScenarioFromQuery = spyOn(component, 'setScenarioFromQuery');
    const setMapFromQuery = spyOn(component, 'setMapFromQuery');
    expect(setScenarioFromQuery).not.toHaveBeenCalled();
    expect(setMapFromQuery).not.toHaveBeenCalled();
    fixture.detectChanges();
    component.ngOnInit();
    expect(setScenarioFromQuery).toHaveBeenCalled();
    expect(setMapFromQuery).toHaveBeenCalled();
  });

  it('should switch map and scenario when no url queries are given', waitForAsync(() => {
    const switchMap = spyOn(component, 'switchMap');
    const switchScenario = spyOn(component, 'switchScenario');
    expect(switchMap).not.toHaveBeenCalled();
    expect(switchScenario).not.toHaveBeenCalled();
    fixture.detectChanges();
    component.ngOnInit();
    fixture.whenStable().then(() => {
      expect(switchMap).toHaveBeenCalledWith(true);
      expect(switchScenario).toHaveBeenCalledWith(true);
    });
  }));

  it('should switch map and scenario when Generate Map button is clicked', waitForAsync(() => {
    const switchMap = spyOn(component, 'switchMap');
    const switchScenario = spyOn(component, 'switchScenario');
    expect(switchMap).not.toHaveBeenCalled();
    expect(switchScenario).not.toHaveBeenCalled();
    const button = fixture.debugElement.nativeElement.querySelector('#generateButton');
    button.click();
    fixture.whenStable().then(() => {
      expect(switchMap).toHaveBeenCalled();
      expect(switchScenario).toHaveBeenCalled();
    });
  }));

  it('should switch only scenario when "New Scenario" button is clicked', waitForAsync(() => {
    const switchScenario = spyOn(component, 'switchScenario');
    const switchMap = spyOn(component, 'switchMap');
    const button = fixture.debugElement.nativeElement.querySelector('#scenarioButton');
    button.click();
    fixture.whenStable().then(() => {
      expect(switchScenario).toHaveBeenCalledWith(true);
      expect(switchMap).not.toHaveBeenCalled();
    });
  }));

  describe('switchScenario', () => {
    it('should return valid scenario ID', () => {
      for (let i = 0; i < 100; i++) {
        const scenarioID = component.switchScenario(false);
        expect(scenarioID).not.toBeNaN();
        expect(Number.isInteger(scenarioID)).toBeTrue();
        expect(scenarioID).toBeGreaterThanOrEqual(0);
        expect(scenarioID).toBeLessThanOrEqual(ShowMapComponent.scenarios.length);
      }
    });

    it('should set query param `s` to new scenario', () => {
      const scenarioID = component.switchScenario(true);
      expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(
        ['/app'], { queryParams: { s: scenarioID }, queryParamsHandling: 'merge' }
      );
    });
  });

  describe('switchMap', () => {
    it('should return valid Epic Dwarf map ID', () => {
      environment.featureFlags.dynamicMaps = false;
      for (let i = 0; i < 100; i++) {
        const mapID = component.switchMap(false);
        expect(mapID).toContain('ed');
        const mapNum = Number(mapID.replace('ed', ''));
        expect(mapNum).not.toBeNaN();
        expect(Number.isInteger(mapNum)).toBeTrue();
        expect(mapNum).toBeGreaterThanOrEqual(1);
        expect(mapNum).toBeLessThanOrEqual(20);
      }
    });

    it('should return valid dynamic map ID', () => {
      environment.featureFlags.dynamicMaps = true;
      for (let i = 0; i < 100; i++) {
        const mapID = component.switchMap(false);
        expect(mapID).not.toContain('ed');
        const mapNum = Number(mapID);
        expect(mapNum).not.toBeNaN();
        expect(Number.isInteger(mapNum)).toBeTrue();
        expect(mapNum).toBeGreaterThanOrEqual(0);
        expect(mapNum).toBeLessThanOrEqual(ShowMapComponent.maxInt32Unsigned);
      }
    });

    it('should set query param `map` to new map ID', () => {
      const mapID = component.switchMap(true);
      expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(
        ['/app'], { queryParams: { map: mapID }, queryParamsHandling: 'merge' }
      );
    });
  });

  describe('setMapFromQuery', () => {
    let mockActivatedRoute;

    it('should return false when given no mapID', () => {
      const didSetMap = component.setMapFromQuery();
      expect(didSetMap).toBeFalse();
    });

    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule(baseTestBed);
    });

    it('should return true when given valid Epic Dwarf mapID', () => {
      mockActivatedRoute = {
        queryParams: of({}),
        snapshot: {
          queryParamMap: {
            get: () => 'ed1'
          }
        }
      };
      TestBed.overrideProvider(ActivatedRoute, {
        useFactory: () => mockActivatedRoute
      });
      TestBed.compileComponents();
      fixture = TestBed.createComponent(ShowMapComponent);
      component = fixture.componentInstance;

      const didSetMap = component.setMapFromQuery();
      expect(didSetMap).toBeTrue();
    });

    it('should return false when given invalid Epic Dwarf mapID (out of bounds)', () => {
      mockActivatedRoute = {
        queryParams: of({}),
        snapshot: {
          queryParamMap: {
            get: () => 'ed101'
          }
        }
      };
      TestBed.overrideProvider(ActivatedRoute, {
        useFactory: () => mockActivatedRoute
      });
      TestBed.compileComponents();
      fixture = TestBed.createComponent(ShowMapComponent);
      component = fixture.componentInstance;

      const didSetMap = component.setMapFromQuery();
      expect(didSetMap).toBeFalse();
    });

    it('should return false when given invalid Epic Dwarf mapID (non-numeric)', () => {
      mockActivatedRoute = {
        queryParams: of({}),
        snapshot: {
          queryParamMap: {
            get: () => 'edtwo'
          }
        }
      };
      TestBed.overrideProvider(ActivatedRoute, {
        useFactory: () => mockActivatedRoute
      });
      TestBed.compileComponents();
      fixture = TestBed.createComponent(ShowMapComponent);
      component = fixture.componentInstance;

      const didSetMap = component.setMapFromQuery();
      expect(didSetMap).toBeFalse();
    });

    beforeEach(() => {
      environment.featureFlags.dynamicMaps = true;
    });

    it('should return true when given valid dynamic mapID', () => {
      mockActivatedRoute = {
        queryParams: of({}),
        snapshot: {
          queryParamMap: {
            get: () => '1234567'
          }
        }
      };
      TestBed.overrideProvider(ActivatedRoute, {
        useFactory: () => mockActivatedRoute
      });
      TestBed.compileComponents();
      fixture = TestBed.createComponent(ShowMapComponent);
      component = fixture.componentInstance;

      const didSetMap = component.setMapFromQuery();
      expect(didSetMap).toBeTrue();
    });

    it('should return false when given invalid dynamic mapID (out of bounds)', () => {
      mockActivatedRoute = {
        queryParams: of({}),
        snapshot: {
          queryParamMap: {
            get: () => '-123'
          }
        }
      };
      TestBed.overrideProvider(ActivatedRoute, {
        useFactory: () => mockActivatedRoute
      });
      TestBed.compileComponents();
      fixture = TestBed.createComponent(ShowMapComponent);
      component = fixture.componentInstance;

      const didSetMap = component.setMapFromQuery();
      expect(didSetMap).toBeFalse();
    });

    it('should return false when given invalid dynamic mapID (non-numeric)', () => {
      mockActivatedRoute = {
        queryParams: of({}),
        snapshot: {
          queryParamMap: {
            get: () => 'tedwo'
          }
        }
      };
      TestBed.overrideProvider(ActivatedRoute, {
        useFactory: () => mockActivatedRoute
      });
      TestBed.compileComponents();
      fixture = TestBed.createComponent(ShowMapComponent);
      component = fixture.componentInstance;

      const didSetMap = component.setMapFromQuery();
      expect(didSetMap).toBeFalse();
    });
  });

  describe('setScenarioFromQuery', () => {
    let mockActivatedRoute;

    it('should return false when given no scenario ID', () => {
      const didSetScenario = component.setScenarioFromQuery();
      expect(didSetScenario).toBeFalse();
    });

    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule(baseTestBed);
    });

    it('should return true when given valid scenario ID', () => {
      mockActivatedRoute = {
        queryParams: of({}),
        snapshot: {
          queryParamMap: {
            get: () => '0'
          }
        }
      };
      TestBed.overrideProvider(ActivatedRoute, {
        useFactory: () => mockActivatedRoute
      });
      TestBed.compileComponents();
      fixture = TestBed.createComponent(ShowMapComponent);
      component = fixture.componentInstance;

      const didSetScenario = component.setScenarioFromQuery();
      expect(didSetScenario).toBeTrue();
    });

    it('should return false when given invalid scenario ID (out of bounds)', () => {
      mockActivatedRoute = {
        queryParams: of({}),
        snapshot: {
          queryParamMap: {
            get: () => '11'
          }
        }
      };
      TestBed.overrideProvider(ActivatedRoute, {
        useFactory: () => mockActivatedRoute
      });
      TestBed.compileComponents();
      fixture = TestBed.createComponent(ShowMapComponent);
      component = fixture.componentInstance;

      const didSetScenario = component.setScenarioFromQuery();
      expect(didSetScenario).toBeFalse();
    });

    it('should return false when given invalid Epic Dwarf mapID (non-numeric)', () => {
      mockActivatedRoute = {
        queryParams: of({}),
        snapshot: {
          queryParamMap: {
            get: () => 'hi'
          }
        }
      };
      TestBed.overrideProvider(ActivatedRoute, {
        useFactory: () => mockActivatedRoute
      });
      TestBed.compileComponents();
      fixture = TestBed.createComponent(ShowMapComponent);
      component = fixture.componentInstance;

      const didSetScenario = component.setScenarioFromQuery();
      expect(didSetScenario).toBeFalse();
    });
  });

  describe('openShareModal', () => {
    it('should be called when share button is clicked', waitForAsync(() => {
      const openShareModal = spyOn(component, 'openShareModal');
      expect(openShareModal).not.toHaveBeenCalled();
      const button = fixture.debugElement.nativeElement.querySelector('#shareButton');
      button.click();
      fixture.whenStable().then(() => {
        expect(openShareModal).toHaveBeenCalled();
      });
    }));

    it('should set qrCodeString to current full URL', waitForAsync(() => {
      const path = '/app?s=0&map=ed1';
      TestBed.resetTestingModule();
      TestBed.configureTestingModule(baseTestBed);
      TestBed.overrideProvider(Router, {
        useValue: {
          url: path
        }
      });
      TestBed.compileComponents();
      fixture = TestBed.createComponent(ShowMapComponent);
      component = fixture.componentInstance;

      expect(component.currentURL).toEqual('');
      const button = fixture.debugElement.nativeElement.querySelector('#shareButton');
      button.click();
      fixture.whenStable().then(() => {
        expect(component.currentURL).toEqual('http://localhost:4200' + path);
      });
    }));
  });
});
