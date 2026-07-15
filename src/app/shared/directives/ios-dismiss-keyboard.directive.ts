import { Directive, HostListener, inject, input } from '@angular/core';
import { IosViewportService } from '../../core/services/ios-viewport.service';

/**
 * Tap this element (or its non-input children) to close the iOS keyboard.
 * Example: <main appIosDismissKeyboard> or <mat-card appIosDismissKeyboard>
 */
@Directive({
  selector: '[appIosDismissKeyboard]',
  standalone: true
})
export class IosDismissKeyboardDirective {
  private readonly iosViewport = inject(IosViewportService);

  readonly appIosDismissKeyboard = input(true, {
    transform: (value: boolean | string) => value !== false && value !== 'false'
  });

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (!this.appIosDismissKeyboard()) {
      return;
    }
    this.iosViewport.dismissKeyboardIfOutsideTap(event);
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.appIosDismissKeyboard()) {
      return;
    }
    this.iosViewport.dismissKeyboardIfOutsideTap(event);
  }
}
