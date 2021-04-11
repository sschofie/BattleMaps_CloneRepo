import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';

import { MapLegendComponent } from './map-legend.component';
import { ShowMapComponent } from '../show-map.component';
import { DynamicMap } from '../../dynamic-map/dynamic-map';
import { CollapseBasicComponent } from '../../collapse-basic/collapse-basic.component.spec';

describe('MapLegendComponent', () => {
  let component: MapLegendComponent;
  let fixture: ComponentFixture<MapLegendComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        MapLegendComponent,
        CollapseBasicComponent
      ],
      providers: [
        ShowMapComponent,
        DynamicMap
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
