import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="not-found-container">
      <div class="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <button class="btn btn-primary" (click)="goHome()">Go to Home</button>
      </div>
    </main>
  `,
  styles: [`
    .not-found-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: var(--spacing-lg);
    }

    .not-found-content {
      text-align: center;
      max-width: 500px;
    }

    h1 {
      font-size: 5rem;
      margin-bottom: var(--spacing-md);
      color: var(--color-primary);
    }

    h2 {
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
export class NotFoundComponent {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/']);
  }
}
