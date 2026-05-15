import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="page-container">
      <div class="page-content">
        <h1>Forgot Password</h1>
        <p>Password reset functionality coming soon.</p>
        <button class="btn btn-primary" (click)="goBack()">Back to Login</button>
      </div>
    </main>
  `,
  styles: [`
    .page-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: var(--spacing-lg);
    }

    .page-content {
      text-align: center;
      max-width: 500px;
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
export class ForgotPasswordComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/login']);
  }
}
