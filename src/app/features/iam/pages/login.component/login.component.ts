import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false]
    });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      this.router.navigate(['/dashboard']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password, remember } = this.loginForm.value;

    // Demo validation - Replace with actual API call
    this.authenticateUser(email, password, remember);
  }

  private authenticateUser(email: string, password: string, remember: boolean): void {
    // Demo credentials
    const validEmail = 'admin@tennisacademy.com';
    const validPassword = 'admin123';

    setTimeout(() => {
      if (email === validEmail && password === validPassword) {
        // Success
        const token = 'demo-token-' + new Date().getTime();

        if (remember) {
          localStorage.setItem('authToken', token);
        } else {
          sessionStorage.setItem('authToken', token);
        }

        localStorage.setItem('userEmail', email);

        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
      } else {
        // Error
        this.errorMessage = 'Credenciales incorrectas. Por favor verifica tu email y contraseña.';
        this.isLoading = false;
      }
    }, 1000); // Simulate API delay
  }

  // For actual API integration, replace authenticateUser with:
  /*
  private authenticateUser(email: string, password: string, remember: boolean): void {
    this.authService.login(email, password).subscribe({
      next: (response) => {
        if (remember) {
          localStorage.setItem('authToken', response.token);
        } else {
          sessionStorage.setItem('authToken', response.token);
        }
        localStorage.setItem('userEmail', email);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error en el inicio de sesión';
        this.isLoading = false;
      }
    });
  }
  */

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
