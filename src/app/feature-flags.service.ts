import { environment } from './../environments/environment';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class FeatureFlagsService {
    private flags = environment.featureFlags;
    isFeatureFlagEnabled(flag: string) {
      return !!this.flags[flag];
    }
  }
