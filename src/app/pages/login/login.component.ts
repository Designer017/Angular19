import {
  Component,
  OnInit,
  AfterViewInit,
  signal,
  computed,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { IosScrollContainerDirective } from '../../shared/directives/ios-scroll-container.directive';

const CITY_NAMES = [
  'Ahmedabad',
  'Surat',
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Chennai',
  'Kolkata',
  'Pune',
  'Hyderabad',
  'Jaipur'
] as const;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatAutocompleteModule,
    IosScrollContainerDirective
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, AfterViewInit {
  private readonly showPassword = signal(false);
  private readonly isLoading = signal(false);

  readonly cities: readonly string[] = CITY_NAMES;
  filteredCities$!: Observable<string[]>;

  private readonly formValid = computed(() => this.loginForm?.valid ?? false);
  readonly submitButtonDisabled = computed(
    () => !this.formValid() || this.isLoading()
  );

  loginForm!: FormGroup;
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly showPassword$ = this.showPassword.asReadonly();
  readonly isLoading$ = this.isLoading.asReadonly();

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      city: ['', [Validators.required, this.cityValidator.bind(this)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
      rememberMe: [false]
    });

    const cityControl = this.loginForm.get('city')!;
    this.filteredCities$ = cityControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterCities(typeof value === 'string' ? value : ''))
    );
  }

  ngAfterViewInit(): void {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginForm.patchValue({
        email: rememberedEmail,
        rememberMe: true
      });
    }
  }

  private filterCities(search: string): string[] {
    const term = search.trim().toLowerCase();
    if (!term) {
      return [...this.cities];
    }
    return this.cities.filter((city) => city.toLowerCase().includes(term));
  }

  private cityValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value as string)?.trim();
    if (!value) {
      return null;
    }
    const match = this.cities.some(
      (city) => city.toLowerCase() === value.toLowerCase()
    );
    return match ? null : { invalidCity: true };
  }

  getControl(name: string): AbstractControl | null {
    return this.loginForm.get(name);
  }

  hasError(fieldName: string, errorType: string): boolean {
    const control = this.loginForm.get(fieldName);
    return !!(control?.hasError(errorType) && control.touched);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (!control?.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;
    if (fieldName === 'email') {
      if (errors['required']) return 'Email is required';
      if (errors['email']) return 'Please enter a valid email address';
    }
    if (fieldName === 'city') {
      if (errors['required']) return 'City is required';
      if (errors['invalidCity']) return 'Please select a city from the list';
    }
    if (fieldName === 'password') {
      if (errors['required']) return 'Password is required';
      if (errors['minlength']) return 'Password must be at least 6 characters';
      if (errors['maxlength']) return 'Password cannot exceed 50 characters';
    }
    return 'Invalid field';
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }

  getPasswordInputType(): string {
    return this.showPassword() ? 'text' : 'password';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading.set(true);
    const { email, rememberMe } = this.loginForm.getRawValue();

    setTimeout(() => {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      this.isLoading.set(false);
      this.router.navigate(['/dashboard']);
    }, 1500);
  }

  onForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}
