import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthServ } from '../../core/auth.service';
import { NotificationService } from '../../core/notification.service';

//Validador: password y confirmPassword deben coincidir
function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  if (!pass || !confirm) return null;
  return pass === confirm ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthServ);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      username: ['', Validators.required],
      mail: ['', [Validators.required, Validators.email]],
      birthDate: ['', Validators.required], 
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: [passwordsMatchValidator] }
  );

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.notify('Revisá los campos del formulario.');
      return;
    }

    const username = this.form.controls.username.value.trim().toLowerCase();
    const mail = this.form.controls.mail.value.trim().toLowerCase();
    const birthDate = this.form.controls.birthDate.value; 
    const password = this.form.controls.password.value;

    this.loading.set(true);

    this.auth.register({ username, mail, birthDate, password }).subscribe({
      next: () => {
        this.router.navigateByUrl('/catalog');
      },
      error: (err: any) => {
        console.error('REGISTER ERROR:', err?.error || err);
        this.notification.notify(
          typeof err?.error === 'string'
            ? err.error
            : err?.error?.message || err?.error?.error || 'No se pudo crear la cuenta'
        );
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }

  // Helpers para el HTML
  get passwordsMismatch(): boolean {
    return !!this.form.errors?.['passwordsMismatch'];
  }
}
