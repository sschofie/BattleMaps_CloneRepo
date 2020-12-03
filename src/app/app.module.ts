import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { ShowMapComponent } from './show-map/show-map.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { MapGeneratorComponent } from './map-generator/map-generator.component';

const routes: Routes = [
  { path: '', redirectTo: '/landing-page', pathMatch: 'full' },
  { path: 'landing-page', component: LandingPageComponent },
  { path: 'app', component: MapGeneratorComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    ShowMapComponent,
    LandingPageComponent,
    MapGeneratorComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
