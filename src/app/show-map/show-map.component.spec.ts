import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { MapGeneratorComponent } from '../map-generator/map-generator.component';

import { ShowMapComponent } from './show-map.component';

describe('ShowMapComponent', () => {
  let component: ShowMapComponent;
  let fixture: ComponentFixture<ShowMapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ShowMapComponent],
      imports: [
        RouterTestingModule.withRoutes(
          [{path: 'app', component: MapGeneratorComponent}]
        )
      ],
      providers: [
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
            navigate: jasmine.createSpy('navigate'),
            url: '/app?s=0&map=ed1'
          }
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should try to set scenario and map from queries on init ', () => {
    const setScenarioFromQuery = spyOn(component, 'setScenarioFromQuery');
    const setMapFromQuery = spyOn(component, 'setMapFromQuery');
    expect(setScenarioFromQuery).not.toHaveBeenCalled();
    expect(setMapFromQuery).not.toHaveBeenCalled();
    component.ngOnInit();
    expect(setScenarioFromQuery).toHaveBeenCalled();
    expect(setMapFromQuery).toHaveBeenCalled();
  });

  it('should switch map and scenario and navigate when no url queries are given', () => {
    const switchMap = spyOn(component, 'switchMap');
    const switchScenario = spyOn(component, 'switchScenario');
    expect(switchMap).not.toHaveBeenCalled();
    expect(switchScenario).not.toHaveBeenCalled();
    component.ngOnInit();
    expect(switchMap).toHaveBeenCalled();
    expect(switchScenario).toHaveBeenCalled();
    expect(TestBed.inject(Router).navigate).toHaveBeenCalled();
  });

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

  it('should open share modal when share button is clicked', waitForAsync(() => {
    const openShareModal = spyOn(component, 'openShareModal');
    expect(openShareModal).not.toHaveBeenCalled();
    const button = fixture.debugElement.nativeElement.querySelector('#shareButton');
    button.click();
    fixture.whenStable().then(() => {
      expect(openShareModal).toHaveBeenCalled();
    });
  }));

  it('should set qrCodeString to current full URL', waitForAsync(() => {
    expect(component.qrCodeString).toEqual('');
    const button = fixture.debugElement.nativeElement.querySelector('#shareButton');
    button.click();
    fixture.whenStable().then(() => {
      expect(component.qrCodeString).toEqual('http://localhost:4200/app?s=0&map=ed1');
    });
  }));
});
