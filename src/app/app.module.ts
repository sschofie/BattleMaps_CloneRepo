import { FeatureFlagsService } from './feature-flag/feature-flags.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { QRCodeModule } from 'angularx-qrcode';
import { ClipboardModule } from 'ngx-clipboard';

import { AppComponent } from './app.component';
import { ShowMapComponent } from './show-map/show-map.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { MapGeneratorPageComponent } from './map-generator-page/map-generator-page.component';
import { DynamicMap } from './dynamic-map/dynamic-map';
import { FeatureFlagDirective } from './feature-flag/feature-flag.directive';
import { ToastComponent } from './toast/toast.component';
import { CollapseBasicComponent } from './collapse-basic/collapse-basic.component';
import { MapLegendComponent } from './show-map/map-legend/map-legend.component';

const routes: Routes = [
  { path: '', redirectTo: '/landing-page', pathMatch: 'full' },
  { path: 'landing-page', component: LandingPageComponent },
  { path: 'app', component: MapGeneratorPageComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    ShowMapComponent,
    LandingPageComponent,
    MapGeneratorPageComponent,
    FeatureFlagDirective,
    ToastComponent,
    CollapseBasicComponent,
    MapLegendComponent

  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
    NgbModule,
    QRCodeModule,
    ClipboardModule
  ],
  providers: [
    DynamicMap,
    FeatureFlagsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
