# Angular 20 SCSS Mobile-First Web Application

A production-ready Angular 20 starter project optimized for mobile web applications with full iOS Safari compatibility, SCSS styling, and responsive design.

## 📋 Features

### Architecture
- ✅ **Standalone API**: Angular 20 standalone components throughout
- ✅ **Scalable Structure**: Clean folder organization for growth
- ✅ **Strict Mode**: TypeScript strict mode enabled
- ✅ **SCSS Styling**: Complete SCSS-based styling with CSS variables
- ✅ **Routing**: Full routing configuration with lazy loading support

### Mobile Optimization
- ✅ **Mobile-First Design**: Responsive from mobile to desktop
- ✅ **iOS Safari Fix**: Visual Viewport API for keyboard handling
- ✅ **Dynamic Viewport Height**: CSS variables for proper layout
- ✅ **Touch-Friendly**: 44px+ touch targets, proper spacing
- ✅ **Prevent Layout Shift**: Body overflow handling, smooth scrolling

### UI/UX
- ✅ **Modern Design**: Clean, contemporary interface
- ✅ **CSS Variables**: Easy theme customization
- ✅ **Smooth Animations**: Transitions and keyframe animations
- ✅ **Dark Mode Ready**: Structure for dark mode support
- ✅ **Accessibility**: ARIA labels, semantic HTML, focus states

### Components & Pages
- ✅ **Login Page**: Fully functional with validation
- ✅ **Password Toggle**: Show/hide password with icon
- ✅ **Remember Me**: Checkbox with localStorage integration
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Loading States**: Button loading spinner
- ✅ **Responsive Layout**: Mobile, tablet, desktop views

### Services
- ✅ **ViewportService**: iOS keyboard compatibility
- ✅ **Reactive Forms**: FormBuilder with validators
- ✅ **Environment Config**: Development & production setups
- ✅ **Observable-based**: RxJS integration ready

## 📁 Project Structure

```
angular20app/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   └── services/
│   │   │       └── viewport.service.ts
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   └── utilities/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   └── login.component.scss
│   │   │   ├── dashboard/
│   │   │   ├── forgot-password/
│   │   │   ├── signup/
│   │   │   └── not-found/
│   │   ├── models/
│   │   │   └── auth.model.ts
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   ├── styles.scss (Global styles with CSS variables)
│   ├── main.ts
│   └── index.html
├── angular.json
├── tsconfig.json
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (recommended 20+)
- npm 9+ or yarn 3+
- Angular CLI 20

### Installation

1. **Navigate to project directory**
   ```bash
   cd angular20app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   Or with yarn:
   ```bash
   yarn install
   ```

### Development Server

1. **Start the development server**
   ```bash
   ng serve
   ```

2. **Navigate to application**
   ```
   http://localhost:4200/
   ```

3. **The app will automatically reload when you make changes**

### Building for Production

1. **Build the application**
   ```bash
   ng build
   ```

2. **Build with optimizations**
   ```bash
   ng build --configuration production
   ```

   Output will be in `dist/angular20app/`

### Testing

Run unit tests:
```bash
ng test
```

Run with coverage:
```bash
ng test --code-coverage
```

## 📱 iOS Safari Compatibility Features

### Viewport Service
The `ViewportService` handles iOS keyboard compatibility:
- Uses VisualViewport API for accurate height measurements
- Detects keyboard open/close events
- Updates CSS variables dynamically
- Prevents layout shifts when keyboard appears
- Manages body scrolling during input focus

### Key Configurations
- **Minimum Font Size**: 16px on mobile to prevent zoom
- **Viewport Height**: CSS variable `--app-height` for accurate dimensions
- **Scrolling**: `main` element scrolls, `body` fixed
- **Safe Area**: `viewport-fit=cover` for notch support

### Mobile Meta Tags
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Mobile App" />
```

## 🎨 Styling System

### CSS Variables
Global variables are defined in `styles.scss`:

```scss
:root {
  // Colors
  --color-primary: #6366f1;
  --color-danger: #ef4444;
  
  // Spacing
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  
  // Typography
  --font-size-base: 1rem;
  --font-weight-semibold: 600;
  
  // Components
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --radius-md: 0.5rem;
  
  // App Height (dynamic on mobile)
  --app-height: 100vh;
}
```

### SCSS Structure
- **Global styles**: `styles.scss`
- **Component styles**: Component-specific `.scss` files
- **Utilities**: Utility classes in global styles
- **Dark mode**: Media query structure ready

## 🔐 Form Validation

The login component includes:
- **Email validation**: Required, valid format, min length
- **Password validation**: Required, min 6 chars, max 50 chars
- **Form builder**: Reactive forms with strong typing
- **Error messages**: User-friendly validation messages
- **Real-time validation**: Instant feedback

Example:
```typescript
this.loginForm = this.formBuilder.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]],
  rememberMe: [false]
});
```

## 🌍 Routing Configuration

Routes are configured in `app.routes.ts`:

```typescript
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', loadComponent: () => import(...) },
  { path: '**', loadComponent: () => import(...) }
];
```

## 🔧 Configuration Files

### Environment Configuration
Update `environments/environment.ts` for development:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  logLevel: 'debug'
};
```

### TypeScript Configuration
- Strict mode: ✅ Enabled
- ES modules: ✅ Modern syntax
- Path aliases: Ready to configure in `tsconfig.json`

### Angular Configuration
- SCSS as default style format
- Production optimizations configured
- Budget thresholds set for bundle size

## 📦 Dependencies

### Core Dependencies
- **@angular/core**: ^20.0.0
- **@angular/common**: ^20.0.0
- **@angular/platform-browser**: ^20.0.0
- **@angular/router**: ^20.0.0
- **@angular/forms**: ^20.0.0
- **rxjs**: Latest compatible version

### Dev Dependencies
- **@angular/cli**: ^20.0.0
- **@angular/compiler-cli**: ^20.0.0
- **typescript**: Latest compatible
- **sass**: For SCSS compilation

## 🛠️ Development Tips

### Adding a New Component
```bash
ng generate component pages/my-page --standalone
```

### Adding a Service
```bash
ng generate service services/my-service
```

### Adding a Model/Interface
Create in `src/app/models/my-model.ts`:
```typescript
export interface MyModel {
  id: string;
  name: string;
}
```

### Creating Routes
Add to `app.routes.ts`:
```typescript
{
  path: 'my-page',
  loadComponent: () => import('./pages/my-page/my-page.component')
    .then(m => m.MyPageComponent)
}
```

## 📝 Best Practices

### Component Development
1. Use standalone components
2. Use reactive forms for inputs
3. Implement OnDestroy for cleanup
4. Use signals for state management
5. Type everything strictly

### Styling
1. Use CSS variables for consistency
2. Mobile-first media queries
3. SCSS nesting for organization
4. Reusable utility classes
5. Semantic class naming

### Routing
1. Use lazy loading for large features
2. Add route guards for protected routes
3. Provide descriptive route data
4. Use redirects for root paths

## 🚨 Common Issues & Solutions

### iOS Keyboard Overlaps Content
- **Cause**: The `--app-height` CSS variable not updating
- **Solution**: ViewportService automatically handles this. Ensure it's injected in AppComponent.

### 100vh Not Working on Mobile
- **Cause**: Browser viewport changes with keyboard
- **Solution**: Using `--app-height` CSS variable instead. Already configured.

### Form Inputs Zoom on Focus
- **Cause**: Font size below 16px on mobile
- **Solution**: All inputs have minimum 16px font size on mobile (configured in SCSS).

### Body Scrolling with Keyboard
- **Cause**: Overflow not properly managed
- **Solution**: Body is fixed, only `<main>` scrolls. Configured in global styles.

## 📚 Resources

- [Angular Documentation](https://angular.dev)
- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [SCSS Documentation](https://sass-lang.com)
- [MDN Web Docs](https://developer.mozilla.org)

## 📄 License

This project is open source and available under the MIT License.

## 👥 Contributing

Contributions are welcome! Please follow the existing code style and structure.

## 📞 Support

For issues, questions, or suggestions, please create an issue in the project repository.

---

**Created**: 2026
**Angular Version**: 20
**Node Version**: 18+
**Last Updated**: May 15, 2026
