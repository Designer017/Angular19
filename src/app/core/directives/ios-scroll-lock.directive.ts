import { Directive, HostListener, OnDestroy } from '@angular/core';
import { IosScrollLockService } from '../services/ios-scroll-lock.service';

@Directive({
  selector: '[iosScrollLock]',
  standalone: true,
})
export class IosScrollLockDirective implements OnDestroy {
  constructor(private readonly iosScrollLockService: IosScrollLockService) {}

  @HostListener('focus')
  onFocus(): void {
    this.iosScrollLockService.lock();
  }

  @HostListener('blur')
  onBlur(): void {
    this.iosScrollLockService.unlock();
  }

  ngOnDestroy(): void {
    this.iosScrollLockService.unlock();
  }
}
