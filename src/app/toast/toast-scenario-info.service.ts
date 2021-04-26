import { Injectable, TemplateRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastScenarioInfoService {
  toasts: any[] = [];

  show(title: string, reference: string, textOrTpl: string | TemplateRef<any>, options: any = {}) {
    this.toasts.push({title, reference, textOrTpl, ...options });
  }

  remove(toast) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}
