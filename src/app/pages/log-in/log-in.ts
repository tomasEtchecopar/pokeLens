import { Component, inject } from '@angular/core';
import { AuthServ } from '../../core/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/notification.service';
import { IdleLogoutService } from '../../core/idle-logout.service';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css',
})
export class LogIn {
  private readonly auth = inject(AuthServ);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);
  readonly sessionTimer = inject(IdleLogoutService);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  logIn() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.notify('Complete correctamente todos los campos');
      return;
    }

    const { username, password } = this.form.getRawValue();

    this.auth.login(username, password).subscribe({
      next: () => {
        this.sessionTimer.start();
        this.router.navigateByUrl('/catalog');
      },
      error: (err: any) => {
        console.error('LOGIN ERROR:', err);

        const msg =
          typeof err?.error === 'string'
            ? err.error
            : err?.error?.message || err?.error?.error;

        if (err?.status === 0) {
          this.notification.notify('No se pudo conectar al servidor (CORS / API caída)');
          return;
        }

        if (err?.status === 401) {
          this.notification.notify(msg || 'Usuario o contraseña incorrectos');
          return;
        }

        this.notification.notify(msg || 'Error al iniciar sesión');
      },
    });
  }
}
