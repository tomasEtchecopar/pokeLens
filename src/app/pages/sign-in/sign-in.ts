import { Component, inject, input, model, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PointEvent } from '../../user/user-model';
import { User } from '../../user/user-model';
import { UserClient } from '../../core/user-client.service';
import { AuthServ } from '../../core/auth.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { PointsService } from '../../core/points.service';
import { NotificationService } from '../../core/notification.service';

const emailPatter = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

/**
 * SignIn component handles both user registration and profile editing.
 * Features real-time email/username validation and automatic avatar generation.
 * Now uses modularized database structure (teams, points_history tables).
 */
@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn implements OnInit {
  private readonly users: UserClient = inject(UserClient);
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthServ);
  private readonly router = inject(Router);
  private readonly points = inject(PointsService);
  private readonly notification = inject(NotificationService);

  // Dual-mode: registration vs profile editing
  readonly isEditing = model<boolean>(false);
  readonly client = input<User>();

  // Real-time validation flags
  protected emailTaken = false;
  protected usernameTaken = false;

  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    age: [0, [Validators.required, Validators.min(8)]],
    mail: this.formBuilder.nonNullable.control(
      '',
      { validators: [Validators.required, Validators.email, Validators.pattern(emailPatter)], updateOn: 'blur' }
    ),
    password: ['', Validators.required]
  });

  /**
   * Sets up real-time email/username uniqueness validation.
   * Debounced to avoid excessive API calls. Skips checks during editing if values haven't changed.
   */
  ngOnInit(): void {
    const u = this.client();
    if (this.isEditing() && u) {
      this.form.patchValue({
        username: u.username ?? '',
        age: u.age ?? 8,
        mail: u.mail ?? '',
        password: u.password ?? ''
      });
    }

    // EMAIL validation
    this.form.controls.mail.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(raw => {
          const ctrl = this.form.controls.mail;
          const value = (raw ?? '').trim().toLowerCase();

          // Skip check if empty or invalid
          if (!value || ctrl.invalid) {
            this.emailTaken = false;
            return of(false);
          }

          // Skip check during editing if email hasn't changed
          const current = this.client();
          if (this.isEditing() && current?.mail?.trim().toLowerCase() === value) {
            this.emailTaken = false;
            return of(false);
          }

          return this.auth.existsEmail(value);
        })
      )
      .subscribe(exists => {
        this.emailTaken = exists;
      });

    // USERNAME validation
    this.form.controls.username.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(username => username?.trim()
          ? this.auth.existsUsername(username.trim())
          : of(false)
        )
      )
      .subscribe(exists => {
        const current = this.client();
        if (this.isEditing() && current?.username) {
          const newVal = (this.form.controls.username.value ?? '').trim().toLowerCase();
          const oldVal = current.username.trim().toLowerCase();
          this.usernameTaken = exists && newVal !== oldVal;
        } else {
          this.usernameTaken = exists;
        }
      });
  }

  /**
   * Handles form submission for both registration and profile editing.
   *
   * Registration flow (updated for modularized DB):
   * 1. Generates avatar from username hash
   * 2. Awards random welcome points (0-20)
   * 3. Creates user with initialized fields (login_dates, last_team_created_at)
  * 4. Backend automatically adds points to points_history table
   * 5. Sets active session and redirects to home
   *
   * Edit flow:
   * 1. Preserves existing points, login_dates, and teams
   * 2. Updates only form fields
   * 3. Syncs with activeUser and localStorage
   */
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.notify('El formulario es inválido.');
      return;
    }
    if (this.emailTaken) { this.notification.notify('Ese email ya está registrado.'); return; }
    if (this.usernameTaken) { this.notification.notify('Ese usuario ya existe.'); return; }

    const datosUser = this.form.getRawValue();

    // EDIT MODE
    if (this.isEditing()) {
      const current = this.auth.activeUser();
      if (!current?.id) { this.notification.notify('No se encontró el usuario a editar'); return; }

      // Preserve existing data, only update form fields
      const updated: User = {
        ...current,
        ...datosUser,
        id: current.id,
        points: current.points ?? 0,
        login_dates: current.login_dates ?? [],
        last_team_created_at: current.last_team_created_at
      };

      this.users.updateUser(updated, current.id).subscribe({
        next: (res) => {
          this.auth.activeUser.set(res);
          localStorage.setItem('activeUser', JSON.stringify(res));
          this.notification.notify('Perfil actualizado');
          this.isEditing.set(false);
        },
        error: (err) => {
          console.error(err);
          this.notification.notify('No se pudo actualizar el perfil');
        }
      });
    }
    else {
      // REGISTRATION MODE
      const usernameKey = datosUser.username.trim().toLowerCase();
      const puntos = this.points.randomPoints();

      // Initialize new user with modularized structure
      const newUser: User = {
        ...datosUser,
        points: puntos,
        login_dates: [new Date().toISOString()], // First login
        last_team_created_at: null, // No teams yet
      };

      this.users.addUser(newUser).subscribe({
        next: ({ user, token }) => {
          this.notification.notify(`Usuario registrado! Has recibido ${puntos} puntos de Bienvenida!`);

          // Backend automatically adds welcome points to points_history table
          // No need to call addHistory manually

          // Save user and token
          this.auth.activeUser.set(user);
          localStorage.setItem('activeUser', JSON.stringify(user));
          localStorage.setItem('token', token);

          this.form.reset({ username: '', age: undefined, mail: '', password: '' });
          this.emailTaken = false;
          this.usernameTaken = false;
          return this.router.navigateByUrl('/home');
        },
        error: (err) => {
          console.error(err);
          this.notification.notify(err.error?.error || 'No se pudo registrar el usuario');
        }
      });
    }
  }
}
