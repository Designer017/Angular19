# iOS Safari Keyboard & Scroll Fix — Reusable Implementation Prompt

Copy everything below the line into Cursor, ChatGPT, or your task tracker when applying this to **another Angular SPA** (or adapt for React/Vue).

---

## PROMPT START

Fix iOS Safari / PWA / WKWebView keyboard and scroll behavior in an Angular standalone SPA.

### Problem

On iPhone/iPad, when an input is focused:

- The keyboard opens and the **entire page scrolls** instead of only an inner container
- Layout **jumps** (blank gaps, header disappears, black area below)
- `100vh` is unreliable when the keyboard opens
- Document-level scroll indicators appear
- User wants: **sticky header**, **inner-only scroll**, **tap outside to close keyboard**, **scroll to close keyboard**

### Goals

1. Lock `html` / `body` — no document scroll
2. Only `.app-scroll` scrolls vertically
3. Sticky header inside scroll container (does not jump)
4. Do **not** resize/reposition `.app-shell` on keyboard (causes blank header gap on iOS)
5. Use VisualViewport API for metrics only (not shell `top: offsetTop`)
6. Hide scrollbars on iOS when keyboard is open
7. Dismiss keyboard: tap outside inputs, scroll, swipe in scroll area
8. Inputs `font-size >= 16px` to prevent zoom
9. Works in: iOS Safari, PWA, WKWebView, Angular routing

---

### Architecture

```
html/body          → position: fixed, overflow: hidden, height: 100%
app-root
  .app-shell       → position: fixed, inset: 0, height: 100% (NEVER shrink on keyboard)
    router-outlet
      .page-shell   → flex column, height: 100%, overflow: hidden
        .app-scroll → ONLY scrollable area (overflow-y: auto)
          header     → position: sticky; top: 0; solid background
          content
```

**Critical rule:** Never set `body { height: visualViewport.height }` and never move `.app-shell` with `top: visualViewport.offsetTop` — iOS pans the layout viewport and this creates blank space where the header was.

---

### Files to create

```
src/
  styles/_ios-viewport.scss
  app/core/services/ios-viewport.service.ts
  app/shared/directives/ios-scroll-container.directive.ts
  app/shared/directives/ios-dismiss-keyboard.directive.ts
```

### index.html meta

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no" />
<meta name="apple-mobile-web-app-capable" content="yes" />
```

### app.config.ts

```typescript
import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { IosViewportService } from './core/services/ios-viewport.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => inject(IosViewportService).init())
  ]
};
```

### app.component.html

```html
<div class="app-shell">
  <router-outlet />
</div>
```

### Page template pattern

```html
<main class="page-shell" role="main" appIosDismissKeyboard>
  <div class="app-scroll" appIosScrollContainer>
    <header class="page-header my-header">
      <!-- sticky header content -->
    </header>
    <div class="page-content">
      <!-- forms, cards -->
    </div>
  </div>
</main>
```

Import in standalone component:

```typescript
import { IosScrollContainerDirective } from '.../ios-scroll-container.directive';
import { IosDismissKeyboardDirective } from '.../ios-dismiss-keyboard.directive';
```

### styles.scss

```scss
@use './styles/ios-viewport';
```

Create `src/styles/_ios-viewport.scss` with:

- `@mixin hide-scrollbar` — `scrollbar-width: none`, `::-webkit-scrollbar { display: none }`
- `html.ios-scroll-lock, body.ios-scroll-lock` — `position: fixed; inset: 0; overflow: hidden; height: 100%`
- `.app-shell` — `position: fixed; inset: 0; height: 100%` — **no** `html.keyboard-open` height override on shell
- `.page-shell` — flex column, `height: 100%`, `overflow: hidden`
- `.app-scroll` — `flex: 1; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain`
- `html.ios.keyboard-open` — hide scrollbars on html, body, shell; keep `.app-scroll` scrollable
- `input, textarea, select` — `font-size: max(16px, 1rem)`

### Sticky header CSS (per page)

```scss
.my-header {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
  background: var(--bg-primary); // MUST be solid, not transparent
  transform: translateZ(0);
}
```

**Do not use** `margin: auto` on flex children inside scroll (causes vertical centering → white gap when keyboard opens). Use `margin-inline: auto` only.

---

### IosViewportService responsibilities

`providedIn: 'root'`, call `init()` in `provideAppInitializer`.

| Feature | Implementation |
|--------|----------------|
| iOS detect | `/iPad\|iPhone\|iPod/` or iPad desktop UA |
| Document lock | `html/body` classes `ios-scroll-lock`, `position: fixed` |
| Touch guard | `touchmove` preventDefault outside `.app-scroll` |
| Keyboard class | `keyboard-open` on html/body when input focused or vv height delta > 120px |
| VisualViewport | Listen `resize` only (NOT `scroll` — causes jitter) |
| Focus input | After 300ms, `scrollBy` inside `.app-scroll` if input below visible area; guard 450ms to ignore dismiss |
| Dismiss keyboard | `activeElement.blur()` |
| Tap outside | `touchend` + `click` capture; skip `INPUT_ZONE` (input, mat-form-field, cdk-overlay); skip buttons/links |
| Scroll dismiss | `touchmove` deltaY > 8px or `scroll` delta > 8px in `.app-scroll` |
| Public API | `dismissKeyboard()`, `dismissKeyboardIfOutsideTap(event)`, `shouldDismissForOutsideTap(target)`, `isKeyboardOpen()` |

**INPUT_ZONE_SELECTOR** (do not dismiss when tapping):

```
input, textarea, select, mat-form-field, .mat-mdc-form-field,
.mat-mdc-text-field-wrapper, .mat-mdc-form-field-infix, .cdk-overlay-container
```

**INTERACTIVE_SELECTOR** (do not dismiss — let click work):

```
button, a, [role="button"], mat-checkbox, .mat-mdc-option, .mat-mdc-icon-button, .mat-mdc-button-base
```

---

### ios-scroll-container.directive.ts

```typescript
@Directive({
  selector: '[appIosScrollContainer]',
  standalone: true,
  host: { class: 'app-scroll', '[attr.data-ios-scroll]': 'true' }
})
```

### ios-dismiss-keyboard.directive.ts

```typescript
@HostListener('touchend', ['$event'])
@HostListener('click', ['$event'])
// call iosViewport.dismissKeyboardIfOutsideTap(event)
```

---

### Common mistakes to avoid

| Mistake | Result |
|--------|--------|
| Shrink `body` or `.app-shell` to `visualViewport.height` on keyboard | Black gap / blank header |
| `padding-top: visualViewport.offsetTop` on body | Double pan, white gap |
| `top: offsetTop` on shell without careful debounce | Header jumps every frame |
| Listen to `visualViewport` `scroll` event | Layout jitter |
| Sticky header with transparent background | Content shows through while scrolling |
| `margin: auto` on form wrapper in flex scroll | Huge white space when keyboard open |
| `scrollIntoView()` on document | Whole page moves |
| `100vh` for page height | Wrong height when keyboard open — use `100%` chain + fixed shell |

---

### Testing checklist (real iPhone)

- [ ] Focus input → only `.app-scroll` moves, not the page
- [ ] Sticky header stays visible, no blank bar above content
- [ ] Tap header / card background → keyboard closes
- [ ] Tap another field → keyboard stays, focus switches
- [ ] Scroll form → keyboard closes
- [ ] Tap Sign in / buttons → button works
- [ ] PWA standalone mode
- [ ] Route change → layout still correct
- [ ] No input zoom (16px font)

---

### Optional adaptations

- **No Angular Material:** Remove `mat-form-field` from `INPUT_ZONE_SELECTOR`
- **Fixed header outside scroll:** Use `.page-header` as `flex-shrink: 0` sibling of `.app-scroll` (not sticky) — only if sticky causes issues
- **Android:** Call `attachKeyboardDismissHandlers()` for all touch devices, not only iOS
- **React/Vue:** Same CSS; port service to hook (`useIosViewport`) with identical listeners

---

## PROMPT END

### Reference implementation

See this project's:

- `src/app/core/services/ios-viewport.service.ts`
- `src/styles/_ios-viewport.scss`
- `src/app/shared/directives/ios-scroll-container.directive.ts`
- `src/app/shared/directives/ios-dismiss-keyboard.directive.ts`
- `src/app/pages/login/` (example page)

---

### Short one-liner prompt (quick copy)

> Implement iOS Safari keyboard fix for Angular SPA: fixed html/body, full-height `.app-shell` (never resize on keyboard), single `.app-scroll` inner scroll, sticky header with solid background inside scroll, VisualViewport resize listener (not scroll), IosViewportService with document touch guard + dismiss keyboard on outside tap/scroll, hide scrollbars when keyboard-open, 16px inputs, appIosScrollContainer + appIosDismissKeyboard directives. Avoid offsetTop shell shifting and 100vh. Include Material form-field in input tap zone.
