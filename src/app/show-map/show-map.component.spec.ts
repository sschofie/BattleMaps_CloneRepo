import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowMapComponent } from './show-map.component';

describe('ShowMapComponent', () => {
  let component: ShowMapComponent;
  let fixture: ComponentFixture<ShowMapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowMapComponent ]
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
});
