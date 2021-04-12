import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';

import { MapLegendComponent } from './map-legend.component';
import { ShowMapComponent } from '../show-map.component';
import { DynamicMap } from '../../dynamic-map/dynamic-map';
import { CollapseBasicComponent } from '../../collapse-basic/collapse-basic.component.spec';
import { GeneratorSettingsService } from '../../collapse-basic/generator-settings.service';

describe('MapLegendComponent', () => {
  const baseTestBed = {
    declarations: [ MapLegendComponent ],
    providers: [
      DynamicMap,
      {
        provide: ShowMapComponent,
        useValue: {
          passNodes: () => [],
          document: {
            showWidth: {
              nativeElement:{
                offsetWidth: 600
              }
            }
          }
        }
      },
    ],
    schemas: [ NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA ]
  };

  let component: MapLegendComponent;
  let fixture: ComponentFixture<MapLegendComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule(baseTestBed).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /*it('should create', () => {
    expect(component).toBeTruthy();
  });*/
});
