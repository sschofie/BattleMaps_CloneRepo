import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { FeatureFlagsService } from './feature-flags.service';

@Directive({
  selector: '[appFeatureFlag]',
})
export class FeatureFlagDirective implements OnInit {
  private requiredFlag = '';
  private isHidden = true;
  @Input() set appFeatureFlag(val) {
    if (val) {
      this.requiredFlag = val;
      this.updateView();
    }
  }
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private featureFlags: FeatureFlagsService
  ) {}
  ngOnInit() {
    this.updateView();
  }
  private updateView() {
    if (this.checkValidity()) {
      if (this.isHidden) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.isHidden = false;
      }
    } else {
      this.viewContainer.clear();
      this.isHidden = true;
    }
  }
  private checkValidity() {
    return (
      this.requiredFlag &&
      this.featureFlags.isFeatureFlagEnabled(this.requiredFlag)
    );
  }
}
