import { Component, inject } from '@angular/core';
import { AuthServ } from '../../core/auth-serv';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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

  logIn() {
    if (this.form.invalid) {
      alert('Complete correctamente todos los campos');
      return;
    }

    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password)

    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/catalog']);
    }
  }

}
