import { FeatureFlagsService } from './feature-flag/feature-flags.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { QRCodeModule } from 'angularx-qrcode';
import { ClipboardModule } from 'ngx-clipboard';

import { AppComponent } from './app.component';
import { ShowMapComponent } from './show-map/show-map.component';
import { AboutPageComponent } from './about-page/about-page.component';
import { MapGeneratorPageComponent } from './map-generator-page/map-generator-page.component';
import { DynamicMap } from './dynamic-map/dynamic-map';
import { FeatureFlagDirective } from './feature-flag/feature-flag.directive';
import { ToastComponent } from './toast/toast.component';
import { ToastScenarioInfoComponent } from './toast/toast-scenario-info.component';
import { CollapseBasicComponent } from './collapse-basic/collapse-basic.component';
import { MapLegendComponent } from './show-map/map-legend/map-legend.component';
import { GeneratorSettingsService } from './collapse-basic/generator-settings.service';
import { DynamicTokens } from './dynamic-tokens/dynamic-tokens';

const routes: Routes = [
  { path: '', redirectTo: '/app', pathMatch: 'full' },
  { path: 'landing-page', redirectTo: '/about', pathMatch: 'full'},
  { path: 'about', component: AboutPageComponent },
  { path: 'app', component: MapGeneratorPageComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    ShowMapComponent,
    AboutPageComponent,
    MapGeneratorPageComponent,
    FeatureFlagDirective,
    ToastComponent,
    ToastScenarioInfoComponent,
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
    FeatureFlagsService,
    GeneratorSettingsService,
    DynamicTokens,
    FeatureFlagsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
