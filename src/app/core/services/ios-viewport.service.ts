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
const INPUT_ZONE_SELECTOR = [
  FOCUSABLE_INPUT_SELECTOR,
  'mat-form-field',
  '.mat-mdc-form-field',
  '.mat-mdc-text-field-wrapper',
  '.mat-mdc-form-field-infix',
  '.mat-mdc-form-field-focus-overlay',
  '.cdk-overlay-container'
].join(', ');
const INTERACTIVE_SELECTOR = [
  'button',
  'a',
  '[role="button"]',
  'mat-checkbox',
  '.mat-mdc-checkbox',
  'mat-option',
  '.mat-mdc-option',
  '.mat-mdc-select-trigger',
  '.mat-mdc-icon-button',
  '.mat-mdc-button-base'
].join(', ');
const KEYBOARD_HEIGHT_THRESHOLD = 120;
const SCROLL_DISMISS_THRESHOLD_PX = 8;
const PROGRAMMATIC_SCROLL_GUARD_MS = 450;

/**
 * Locks document scroll on iOS, scrolls focused inputs inside .app-scroll,
 * and dismisses the keyboard on user scroll or tap outside inputs.
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
  private ignoreScrollDismissUntil = 0;
  private touchStartY = 0;
  private touchStartX = 0;
  private touchMoved = false;
  private readonly scrollTops = new WeakMap<HTMLElement, number>();
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

    if (this.isIos()) {
      this.document.documentElement.classList.add('ios');
      this.attachIosTouchGuard();
      this.attachKeyboardDismissHandlers();
    }

    this.updateViewportMetrics();
    this.attachVisualViewportListeners();
    this.attachWindowListeners();
    this.attachFocusHandlers();
    this.lockDocumentScroll();

    this.destroyRef.onDestroy(() => this.teardown());
  }

  findScrollContainer(element: Element | null): HTMLElement | null {
    if (!element) {
      return null;
    }
    return element.closest<HTMLElement>(SCROLL_CONTAINER_SELECTOR);
  }

  /** Blur the active field and close the keyboard. */
  dismissKeyboard(): void {
    const active = this.document.activeElement;
    if (active instanceof HTMLElement && active.matches(FOCUSABLE_INPUT_SELECTOR)) {
      active.blur();
    }

    const root = this.document.documentElement;
    root.classList.remove('keyboard-open');
    this.document.body.classList.remove('keyboard-open');
    this.lastKeyboardOpen = false;
    this.keyboardOpen.set(false);
    this.scheduleViewportUpdate();
  }

  /** True when an input/textarea/select is focused. */
  hasFocusedInput(): boolean {
    const active = this.document.activeElement;
    return active instanceof HTMLElement && active.matches(FOCUSABLE_INPUT_SELECTOR);
  }

  /** Whether a tap on `target` is outside inputs and should close the keyboard. */
  shouldDismissForOutsideTap(target: Element | null): boolean {
    if (!this.hasFocusedInput() || !target) {
      return false;
    }
    if (target.closest(INPUT_ZONE_SELECTOR)) {
      return false;
    }
    if (target.closest(INTERACTIVE_SELECTOR)) {
      return false;
    }
    return true;
  }

  /** Close keyboard when the user taps outside the input area. */
  dismissKeyboardIfOutsideTap(event: Event): void {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (this.shouldDismissForOutsideTap(target)) {
      this.dismissKeyboard();
    }
  }

  private isIos(): boolean {
    const ua = navigator.userAgent;
    return (
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  }

  private shouldIgnoreScrollDismiss(): boolean {
    return Date.now() < this.ignoreScrollDismissUntil;
  }

  private guardProgrammaticScroll(): void {
    this.ignoreScrollDismissUntil = Date.now() + PROGRAMMATIC_SCROLL_GUARD_MS;
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
    const keyboardLikelyOpen =
      layoutHeight - visibleHeight > KEYBOARD_HEIGHT_THRESHOLD ||
      this.hasFocusedInput();

    root.style.setProperty('--visible-viewport-height', `${visibleHeight}px`);
    root.style.setProperty('--visible-viewport-top', `${visibleTop}px`);

    this.setKeyboardState(root, keyboardLikelyOpen);

    if (keyboardLikelyOpen) {
      this.resetDocumentScroll();
    }
  }

  private setKeyboardState(root: HTMLElement, keyboardOpen: boolean): void {
    if (keyboardOpen === this.lastKeyboardOpen) {
      return;
    }
    this.lastKeyboardOpen = keyboardOpen;
    this.keyboardOpen.set(keyboardOpen);
    root.classList.toggle('keyboard-open', keyboardOpen);
    this.document.body.classList.toggle('keyboard-open', keyboardOpen);

    if (keyboardOpen) {
      this.resetDocumentScroll();
    }
  }

  private resetDocumentScroll(): void {
    window.scrollTo(0, 0);
    this.document.documentElement.scrollTop = 0;
    this.document.body.scrollTop = 0;
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

  private attachFocusHandlers(): void {
    this.addListener(this.document, 'focusin', ((event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      if (!target.matches(FOCUSABLE_INPUT_SELECTOR)) {
        return;
      }

      if (this.isIos()) {
        this.document.documentElement.classList.add('keyboard-open');
        this.document.body.classList.add('keyboard-open');
        this.resetDocumentScroll();
      }
      this.scheduleViewportUpdate();

      setTimeout(() => {
        const scrollContainer = this.findScrollContainer(target);
        if (scrollContainer) {
          this.scrollInputIntoView(target, scrollContainer);
        }
        this.updateViewportMetrics();
      }, 300);
    }) as EventListener);

    this.addListener(this.document, 'focusout', (() => {
      setTimeout(() => this.updateViewportMetrics(), 150);
    }) as EventListener);
  }

  /**
   * Dismiss keyboard when the user scrolls or taps outside inputs inside .app-scroll.
   */
  private attachKeyboardDismissHandlers(): void {
    this.addListener(
      this.document,
      'touchstart',
      ((event: TouchEvent) => {
        if (!this.hasFocusedInput()) {
          return;
        }
        const touch = event.touches[0];
        if (!touch) {
          return;
        }
        this.touchStartY = touch.clientY;
        this.touchStartX = touch.clientX;
        this.touchMoved = false;

        const scrollContainer = this.findScrollContainerFromEvent(event);
        if (scrollContainer) {
          this.scrollTops.set(scrollContainer, scrollContainer.scrollTop);
        }
      }) as EventListener,
      { capture: true, passive: true }
    );

    this.addListener(
      this.document,
      'touchmove',
      ((event: TouchEvent) => {
        if (this.shouldIgnoreScrollDismiss() || !this.hasFocusedInput()) {
          return;
        }

        const scrollContainer = this.findScrollContainerFromEvent(event);
        if (!scrollContainer) {
          return;
        }

        const touch = event.touches[0];
        if (!touch) {
          return;
        }

        const deltaY = Math.abs(touch.clientY - this.touchStartY);
        const deltaX = Math.abs(touch.clientX - this.touchStartX);

        if (deltaY > SCROLL_DISMISS_THRESHOLD_PX && deltaY > deltaX) {
          this.touchMoved = true;
          this.dismissKeyboard();
        }
      }) as EventListener,
      { capture: true, passive: true }
    );

    this.addListener(
      this.document,
      'scroll',
      ((event: Event) => {
        if (this.shouldIgnoreScrollDismiss() || !this.hasFocusedInput()) {
          return;
        }

        const target = event.target;
        if (!(target instanceof HTMLElement)) {
          return;
        }

        const scrollContainer = target.matches(SCROLL_CONTAINER_SELECTOR)
          ? target
          : target.closest<HTMLElement>(SCROLL_CONTAINER_SELECTOR);

        if (!scrollContainer) {
          return;
        }

        const previousTop = this.scrollTops.get(scrollContainer) ?? scrollContainer.scrollTop;
        const delta = Math.abs(scrollContainer.scrollTop - previousTop);
        this.scrollTops.set(scrollContainer, scrollContainer.scrollTop);

        if (delta >= SCROLL_DISMISS_THRESHOLD_PX) {
          this.dismissKeyboard();
        }
      }) as EventListener,
      { capture: true, passive: true }
    );

    this.addListener(
      this.document,
      'touchend',
      ((event: TouchEvent) => {
        if (this.shouldIgnoreScrollDismiss() || this.touchMoved) {
          return;
        }
        this.dismissKeyboardIfOutsideTap(event);
      }) as EventListener,
      { capture: true, passive: true }
    );

    this.addListener(
      this.document,
      'click',
      ((event: MouseEvent) => {
        if (this.shouldIgnoreScrollDismiss()) {
          return;
        }
        this.dismissKeyboardIfOutsideTap(event);
      }) as EventListener,
      { capture: true }
    );
  }

  private findScrollContainerFromEvent(event: Event): HTMLElement | null {
    const target = event.target;
    if (!(target instanceof Element)) {
      return null;
    }
    return target.closest<HTMLElement>(SCROLL_CONTAINER_SELECTOR);
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
    this.guardProgrammaticScroll();
    scrollContainer.scrollBy({ top: delta, behavior: 'auto' });
  }

  private lockDocumentScroll(): void {
    this.document.body.classList.add('ios-scroll-lock');
    this.document.documentElement.classList.add('ios-scroll-lock');
  }

  private attachIosTouchGuard(): void {
    this.touchMoveHandler = (event: TouchEvent) => {
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
    this.document.body.classList.remove('ios-scroll-lock', 'keyboard-open', 'ios');
    root.classList.remove('ios-scroll-lock', 'keyboard-open', 'ios');
    root.style.removeProperty('--visible-viewport-height');
    root.style.removeProperty('--visible-viewport-top');
  }
}
