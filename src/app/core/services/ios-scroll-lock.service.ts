import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IosScrollLockService {
  private scrollTop = 0;
  private locked = false;
  private previousStyles = new Map<string, string | null>();

  constructor(@Inject(DOCUMENT) private document: Document) {}

  get isIos(): boolean {
    const userAgent = window.navigator.userAgent || window.navigator.vendor || '';
    const platform = window.navigator.platform || '';
    const isiPadOS13Plus = platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
    const isiPhoneIpodOrIpad = /iPad|iPhone|iPod/.test(userAgent);
    return isiPhoneIpodOrIpad || isiPadOS13Plus;
  }

  lock(): void {
    if (!this.isIos || this.locked) {
      return;
    }

    const body = this.document.body as HTMLElement;
    const html = this.document.documentElement as HTMLElement;

    this.scrollTop = window.pageYOffset || html.scrollTop || body.scrollTop || 0;
    this.saveStyle(body, 'position');
    this.saveStyle(body, 'top');
    this.saveStyle(body, 'left');
    this.saveStyle(body, 'right');
    this.saveStyle(body, 'width');
    this.saveStyle(body, 'overflow');
    this.saveStyle(body, 'height');

    body.style.position = 'fixed';
    body.style.top = `-${this.scrollTop}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    body.style.height = '100vh';

    this.locked = true;
  }

  unlock(): void {
    if (!this.locked) {
      return;
    }

    const body = this.document.body as HTMLElement;

    this.restoreStyle(body, 'position');
    this.restoreStyle(body, 'top');
    this.restoreStyle(body, 'left');
    this.restoreStyle(body, 'right');
    this.restoreStyle(body, 'width');
    this.restoreStyle(body, 'overflow');
    this.restoreStyle(body, 'height');

    window.scrollTo(0, this.scrollTop);
    this.locked = false;
    this.previousStyles.clear();
  }

  private saveStyle(element: HTMLElement, property: string): void {
    this.previousStyles.set(property, element.style.getPropertyValue(property) || null);
  }

  private restoreStyle(element: HTMLElement, property: string): void {
    const previousValue = this.previousStyles.get(property);
    if (previousValue === null) {
      element.style.removeProperty(property);
    } else if (previousValue !== undefined) {
      element.style.setProperty(property, previousValue);
    }
  }
}
