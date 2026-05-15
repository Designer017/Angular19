import { Directive, ElementRef, inject, OnInit } from '@angular/core';

/**
 * Marks an element as the sole scroll container for iOS touch-guard logic.
 * Apply to the inner overflow-y:auto region (class .app-scroll is equivalent).
 */
@Directive({
  selector: '[appIosScrollContainer]',
  standalone: true,
  host: {
    class: 'app-scroll',
    '[attr.data-ios-scroll]': 'true'
  }
})
export class IosScrollContainerDirective implements OnInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  ngOnInit(): void {
    const el = this.elementRef.nativeElement;
    if (!el.classList.contains('app-scroll')) {
      el.classList.add('app-scroll');
    }
  }
}
