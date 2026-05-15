import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="dashboard-container">
      <div class="dashboard-content">
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard! This is a placeholder page.</p>
        <button class="btn btn-primary" (click)="logout()">Logout</button>
      </div>
    </main>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: var(--spacing-lg);
    }

    .dashboard-content {
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
export class DashboardComponent {
  constructor(private router: Router) {}

  logout(): void {
    this.router.navigate(['/login']);
  }
}
