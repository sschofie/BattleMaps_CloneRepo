import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, UrlTree, Router } from '@angular/router';
import { FeatureFlagsService } from './feature-flags.service';
@Injectable({
  providedIn: 'root'
})
export class FeatureFlagGuard implements CanActivate {
  constructor(
    private featureFlags: FeatureFlagsService,
    private router: Router
  ) {}
  canActivate(next: ActivatedRouteSnapshot): boolean | UrlTree {
    const requiredFeatureFlag: string = next.data.requiredFeatureFlag as string;
    const featureFlagRedirect: string =
      (next.data.featureFlagRedirect as string) || '/';
    return this.featureFlags.isFeatureFlagEnabled(requiredFeatureFlag)
    || this.router.createUrlTree([featureFlagRedirect]);
  }

}
