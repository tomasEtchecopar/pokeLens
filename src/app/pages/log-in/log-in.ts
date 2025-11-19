import { Component, inject } from '@angular/core';
import { AuthServ } from '../../core/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

/**
 * LogIn component handles user authentication.
 * Validates credentials and redirects to catalog on success.
 */
@Component({
  selector: 'app-log-in',
  imports: [ReactiveFormsModule],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css',
})
export class LogIn {
  private readonly auth = inject(AuthServ);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  /**
   * Handles login submission.
   * Validates form, calls auth service, and navigates to catalog on success.
   * Shows alerts for validation errors or incorrect credentials.
   */
  logIn() {
    if (this.form.invalid) {
      alert('Complete correctamente todos los campos');
      return;
    }

    const { username, password } = this.form.getRawValue();

    // Subscribe to login observable before navigating (important for proper flow)
    this.auth.login(username, password).subscribe({
      next: () => {
        console.log('Logueado correctamente')
        this.router.navigateByUrl('/catalogo');
      },
      error: (err) => {
        console.error(err);
        alert('Usuario o contraseña incorrectos');
      }
    });
  }
}
