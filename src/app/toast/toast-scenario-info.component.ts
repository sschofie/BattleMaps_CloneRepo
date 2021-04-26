import { Component, HostBinding, TemplateRef } from '@angular/core';

import { ToastScenarioInfoService } from './toast-scenario-info.service';


@Component({
  selector: 'app-toast-scenario-info',
  template: `
    <ngb-toast
      *ngFor="let toast of toastScenarioInfoService.toasts"
      [class]="toast.classname"
      [autohide]="true"
      [delay]="toast.delay || 15000"
      (hidden)="toastScenarioInfoService.remove(toast)"
    >
      <ng-template [ngIf]="isTemplate(toast)" [ngIfElse]="text">
        <ng-template [ngTemplateOutlet]="toast.textOrTpl"></ng-template>
      </ng-template>

      <ng-template #text>{{ toast.textOrTpl }}</ng-template>

      <ng-template ngbToastHeader d-flex justify-content-left>
        <strong class="mr-auto">{{ toast.title }}</strong><small class="mr-2">{{ toast.reference }}</small>
      </ng-template>
    </ngb-toast>
  `,
  //toast appears in top center of map
  styles: [`
    :host {
      height: auto;
    }
    :host ::ng-deep {
      position: absolute!important;
    }
    :host ::ng-deep .toast-header {
      width: 100%;
    }
    :host ::ng-deep .toast-header .close {
      margin-left: 0!important;
      margin-right: 0!important;
      margin-top: 0!important;
      margin-bottom: 0!important;
    }
  `]
})
export class ToastScenarioInfoComponent {
  constructor(public toastScenarioInfoService: ToastScenarioInfoService) { }
  @HostBinding('class.ngb-toasts')

  isTemplate(toast) { return toast.textOrTpl instanceof TemplateRef; }
}
