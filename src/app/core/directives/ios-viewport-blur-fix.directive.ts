import { Directive, HostListener, inject } from '@angular/core';
import { IosViewportFixService } from '../services/ios-viewport-fix.service';

/**
 * Optional per-input blur correction for iOS sticky/fixed bars.
 * Global focusout is already handled by IosViewportFixService; use this
 * when you need an explicit host binding on a form field.
 *
 * Usage: <input matInput iosViewportBlurFix />
 */
@Directive({
  selector: 'input[iosViewportBlurFix], textarea[iosViewportBlurFix]',
  standalone: true
})
export class IosViewportBlurFixDirective {
  private readonly viewportFix = inject(IosViewportFixService);

  @HostListener('blur')
  onBlur(): void {
    if (!this.viewportFix.isIos()) {
      return;
    }

    setTimeout(() => {
      const y = window.scrollY || window.pageYOffset || 0;
      window.scrollTo(0, y);
      this.viewportFix.forceStickyRepaint();
    }, 50);
  }
}
