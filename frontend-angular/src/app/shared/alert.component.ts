import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [NgClass],
  template: `
    @if (message()) {
      <div class="alert" [ngClass]="type() === 'success' ? 'alert-success' : type() === 'error' ? 'alert-danger' : 'alert-info'" role="alert">
        {{ message() }}
      </div>
    }
  `,
})
export class AlertComponent {
  message = input<string | null>(null);
  type = input<'success' | 'error' | 'info'>('info');
}
