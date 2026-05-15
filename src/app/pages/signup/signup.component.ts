import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IosScrollContainerDirective } from '../../shared/directives/ios-scroll-container.directive';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, IosScrollContainerDirective],
  template: `
    <main class="page-shell page-container" role="main">
      <div class="app-scroll page-content" appIosScrollContainer>
        <h1>Sign Up</h1>
        <p>Sign up functionality coming soon.</p>
        <button class="btn btn-primary" (click)="goToLogin()">Go to Login</button>
      </div>
    </main>
  `,
  styles: [`
    .page-container {
      width: 100%;
      height: 100%;
    }

    .page-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100%;
      padding: var(--spacing-lg);
      text-align: center;
      max-width: 500px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: var(--spacing-md);
    }

    p {
      margin-bottom: var(--spacing-lg);
    }

    .btn {
      padding: var(--spacing-md) var(--spacing-lg);
      background-color: var(--color-primary);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      cursor: pointer;
      font-weight: var(--font-weight-semibold);
      transition: all var(--transition-fast) ease;

      &:hover {
        background-color: var(--color-primary-dark);
        transform: translateY(-2px);
      }
    }
  `]
})
export class SignupComponent {
  constructor(private router: Router) {}

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
