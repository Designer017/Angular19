import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  inject,
  signal
} from '@angular/core';

const SCROLL_CONTAINER_SELECTOR = '.app-scroll, [appIosScrollContainer]';
const FOCUSABLE_INPUT_SELECTOR =
  'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])';
const KEYBOARD_HEIGHT_THRESHOLD = 120;

/**
 * Locks document scroll on iOS and scrolls focused inputs inside .app-scroll only.
 * Does NOT resize the app shell — that causes the header blank gap with iOS keyboard pan.
 */
@Injectable({ providedIn: 'root' })
export class IosViewportService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private readonly keyboardOpen = signal(false);
  private initialized = false;
  private rafId: number | null = null;
  private lastKeyboardOpen = false;
  private touchMoveHandler: ((event: TouchEvent) => void) | null = null;
  private readonly boundHandlers: Array<{
    target: EventTarget;
    type: string;
    handler: EventListener;
    options?: AddEventListenerOptions | boolean;
  }> = [];

  readonly isKeyboardOpen = this.keyboardOpen.asReadonly();

  init(): void {
    if (this.initialized || !isPlatformBrowser(this.platformId)) {
      return;
    }
    this.initialized = true;

    this.updateViewportMetrics();
    this.attachVisualViewportListeners();
    this.attachWindowListeners();
    this.attachFocusScrollIntoView();
    this.lockDocumentScroll();

    if (this.isIos()) {
      this.attachIosTouchGuard();
    }

    this.destroyRef.onDestroy(() => this.teardown());
  }

  findScrollContainer(element: Element | null): HTMLElement | null {
    if (!element) {
      return null;
    }
    return element.closest<HTMLElement>(SCROLL_CONTAINER_SELECTOR);
  }

  private isIos(): boolean {
    const ua = navigator.userAgent;
    return (
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  }

  private scheduleViewportUpdate(): void {
    if (this.rafId !== null) {
      return;
    }
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.updateViewportMetrics();
    });
  }

  private updateViewportMetrics(): void {
    const root = this.document.documentElement;
    const vv = window.visualViewport;
    const layoutHeight = window.innerHeight;

    if (!vv) {
      this.setKeyboardState(root, false);
      return;
    }

    const visibleHeight = Math.round(vv.height);
    const visibleTop = Math.max(0, Math.round(vv.offsetTop));
    const keyboardLikelyOpen = layoutHeight - visibleHeight > KEYBOARD_HEIGHT_THRESHOLD;

    root.style.setProperty('--visible-viewport-height', `${visibleHeight}px`);
    root.style.setProperty('--visible-viewport-top', `${visibleTop}px`);

    this.setKeyboardState(root, keyboardLikelyOpen);
  }

  private setKeyboardState(root: HTMLElement, keyboardOpen: boolean): void {
    if (keyboardOpen === this.lastKeyboardOpen) {
      return;
    }
    this.lastKeyboardOpen = keyboardOpen;
    this.keyboardOpen.set(keyboardOpen);
    root.classList.toggle('keyboard-open', keyboardOpen);
  }

  private attachVisualViewportListeners(): void {
    const vv = window.visualViewport;
    if (!vv) {
      return;
    }
    this.addListener(vv, 'resize', () => this.scheduleViewportUpdate());
  }

  private attachWindowListeners(): void {
    this.addListener(window, 'resize', () => this.scheduleViewportUpdate());
    this.addListener(window, 'orientationchange', () => {
      this.lastKeyboardOpen = false;
      setTimeout(() => this.scheduleViewportUpdate(), 300);
    });
  }

  private attachFocusScrollIntoView(): void {
    this.addListener(this.document, 'focusin', ((event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      if (!target.matches(FOCUSABLE_INPUT_SELECTOR)) {
        return;
      }

      this.scheduleViewportUpdate();

      setTimeout(() => {
        const scrollContainer = this.findScrollContainer(target);
        if (scrollContainer) {
          this.scrollInputIntoView(target, scrollContainer);
        }
      }, 300);
    }) as EventListener);
  }

  private scrollInputIntoView(
    input: HTMLElement,
    scrollContainer: HTMLElement
  ): void {
    const vv = window.visualViewport;
    const padding = 16;
    const inputRect = input.getBoundingClientRect();

    const visibleBottom = vv
      ? vv.offsetTop + vv.height
      : window.innerHeight;

    if (inputRect.bottom <= visibleBottom - padding) {
      return;
    }

    const delta = inputRect.bottom - (visibleBottom - padding);
    scrollContainer.scrollBy({ top: delta, behavior: 'auto' });
  }

  private lockDocumentScroll(): void {
    this.document.body.classList.add('ios-scroll-lock');
    this.document.documentElement.classList.add('ios-scroll-lock');
  }

  private attachIosTouchGuard(): void {
    this.touchMoveHandler = (event: TouchEvent): void => {
      const target = event.target;
      if (!(target instanceof Element)) {
        event.preventDefault();
        return;
      }
      if (target.closest(SCROLL_CONTAINER_SELECTOR)) {
        return;
      }
      event.preventDefault();
    };

    this.addListener(this.document, 'touchmove', this.touchMoveHandler as EventListener, {
      passive: false
    });
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

  private teardown(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    for (const { target, type, handler, options } of this.boundHandlers) {
      target.removeEventListener(type, handler, options);
    }
    this.boundHandlers.length = 0;

    const root = this.document.documentElement;
    this.document.body.classList.remove('ios-scroll-lock');
    root.classList.remove('ios-scroll-lock', 'keyboard-open');
    root.style.removeProperty('--visible-viewport-height');
    root.style.removeProperty('--visible-viewport-top');
  }
}
