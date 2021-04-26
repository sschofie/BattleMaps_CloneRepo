import { Component, HostBinding, TemplateRef } from '@angular/core';

import { ToastService } from './toast.service';


@Component({
  selector: 'app-toasts',
  template: `
    <ngb-toast
      *ngFor="let toast of toastService.toasts"
      [class]="toast.classname"
      [autohide]="true"
      [delay]="toast.delay || 5000"
      [header]="toast.header"
      (hidden)="toastService.remove(toast)"
    >
      <ng-template [ngIf]="isTemplate(toast)" [ngIfElse]="text">
        <ng-template [ngTemplateOutlet]="toast.textOrTpl"></ng-template>
      </ng-template>

      <ng-template #text>{{ toast.textOrTpl }}</ng-template>
    </ngb-toast>
  `,
  // override default toast styling to position it bottom-center
  styles: [`
    :host {
      right: auto!important;
      left: 50%!important;
      top: auto!important;
      bottom: 0%!important;
      transform: translate(-50%, -50%);
      margin: 0!important;
    }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) { }
  @HostBinding('class.ngb-toasts')

  isTemplate(toast) { return toast.textOrTpl instanceof TemplateRef; }
}
