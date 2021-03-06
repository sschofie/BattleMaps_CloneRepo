import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ShowMapComponent } from '../show-map/show-map.component';

import { MapGeneratorComponent } from './map-generator.component';

describe('MapGeneratorComponent', () => {
  let component: MapGeneratorComponent;
  let fixture: ComponentFixture<MapGeneratorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        MapGeneratorComponent,
        ShowMapComponent
      ],
      imports: [
        RouterTestingModule.withRoutes(
          [{path: 'app', component: MapGeneratorComponent}]
        )
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
