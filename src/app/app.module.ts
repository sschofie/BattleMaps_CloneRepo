import { FeatureFlagsService } from './feature-flags.service';
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
import { FeatureFlagDirective } from './feature-flag.directive';
import { DynamicMap } from './dynamic-map/dynamic-map';

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
    FeatureFlagDirective
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
