import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  inject
} from '@angular/core';

const FOCUSABLE_INPUT_SELECTOR =
  'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])';

const STICKY_FIXED_SELECTOR =
  '.page-header, .login-top-header, .ios-sticky-fix, [data-ios-sticky-fix]';

/**
 * Fixes iOS Safari/WKWebView sticky/fixed detachment when the keyboard opens.
 * Visual viewport and layout viewport desync; a forced compositing toggle
 * makes WebKit recompute sticky/fixed positions.
 *
 * iOS-only — no-ops on Android/desktop.
 */
@Injectable({ providedIn: 'root' })
export class IosViewportFixService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private initialized = false;
  private rafId: number | null = null;
  private toggling = false;
  private readonly boundHandlers: Array<{
    target: EventTarget;
    type: string;
    handler: EventListener;
    options?: AddEventListenerOptions | boolean;
  }> = [];

  /** Call once from AppComponent (iOS only). */
  init(): void {
    if (this.initialized || !isPlatformBrowser(this.platformId) || !this.isIos()) {
      return;
    }

    this.initialized = true;
    this.document.documentElement.classList.add('ios-viewport-fix');

    this.attachVisualViewportListeners();
    this.attachInputBlurCorrection();

    this.destroyRef.onDestroy(() => this.destroy());
  }

  /** True for iPhone/iPad/iPod and iPadOS desktop UA. */
  isIos(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    return (
      /iPad|iPhone|iPod/.test(ua) ||
      (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  }

  /**
   * Force WebKit to recompute sticky/fixed after visualViewport changes.
   * Toggles translateZ(0) for one frame on sticky bars and the documentElement.
   */
  forceStickyRepaint(): void {
    if (!this.isIos() || this.toggling) {
      return;
    }

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }

    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.toggling = true;

      const root = this.document.documentElement;
      const targets = [
        root,
        ...Array.from(
          this.document.querySelectorAll<HTMLElement>(STICKY_FIXED_SELECTOR)
        )
      ];

      for (const el of targets) {
        el.classList.add('ios-sticky-repaint');
      }

      // Force layout read then clear on next frame
      void root.offsetHeight;

      requestAnimationFrame(() => {
        for (const el of targets) {
          el.classList.remove('ios-sticky-repaint');
        }
        this.toggling = false;
      });
    });
  }

  destroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    for (const { target, type, handler, options } of this.boundHandlers) {
      target.removeEventListener(type, handler, options);
    }
    this.boundHandlers.length = 0;

    this.document.documentElement.classList.remove(
      'ios-viewport-fix',
      'ios-sticky-repaint'
    );
    this.initialized = false;
  }

  private attachVisualViewportListeners(): void {
    const vv = window.visualViewport;
    if (!vv) {
      return;
    }

    const onViewportChange = (): void => this.forceStickyRepaint();
    this.addListener(vv, 'resize', onViewportChange, { passive: true });
    this.addListener(vv, 'scroll', onViewportChange, { passive: true });
  }

  /**
   * On input blur (keyboard closing), nudge scroll so sticky bars re-pin.
   */
  private attachInputBlurCorrection(): void {
    this.addListener(
      this.document,
      'focusout',
      ((event: FocusEvent) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) {
          return;
        }
        if (!target.matches(FOCUSABLE_INPUT_SELECTOR)) {
          return;
        }

        // Defer until keyboard animation finishes
        setTimeout(() => {
          const y = window.scrollY || window.pageYOffset || 0;
          window.scrollTo(0, y);
          this.forceStickyRepaint();
        }, 50);
      }) as EventListener,
      true
    );
  }

  private addListener(
    target: EventTarget,
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions | boolean
  ): void {
    target.addEventListener(type, handler, options);
    this.boundHandlers.push({ target, type, handler, options });
  }
}
