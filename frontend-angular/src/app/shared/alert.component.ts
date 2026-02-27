import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [NgClass],
  templateUrl: './alert.component.html',
})
export class AlertComponent {
  message = input<string | null>(null);
  type = input<'success' | 'error' | 'info'>('info');
}
