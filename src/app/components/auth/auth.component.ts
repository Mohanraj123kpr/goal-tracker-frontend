import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  mode = signal<'login' | 'register'>('login');
  loading = signal(false);
  error = signal('');
  hidePassword = signal(true);

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.loginForm = fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    this.registerForm = fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(72)]],
    });
  }

  switchMode(m: 'login' | 'register'): void {
    this.mode.set(m);
    this.error.set('');
  }

  submit(): void {
    const form = this.mode() === 'login' ? this.loginForm : this.registerForm;
    if (form.invalid) return;

    this.loading.set(true);
    this.error.set('');

    if (this.mode() === 'login') {
      const { email, password } = this.loginForm.value;
      this.auth.login(email, password).subscribe({
        next: () => this.router.navigate(['/']),
        error: (e) => {
          this.error.set(e.error?.detail ?? 'Login failed');
          this.loading.set(false);
        },
      });
    } else {
      const { name, email, password } = this.registerForm.value;
      this.auth.register(email, name, password).subscribe({
        next: () => this.router.navigate(['/']),
        error: (e) => {
          this.error.set(e.error?.detail ?? 'Registration failed');
          this.loading.set(false);
        },
      });
    }
  }
}
