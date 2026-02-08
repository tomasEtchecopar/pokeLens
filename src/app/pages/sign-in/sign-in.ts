import { Component, inject, input, model, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { User } from '../../user/user-model';
import { UserClient } from '../../core/user-client.service';
import { AuthServ } from '../../core/auth.service';
import { debounceTime, distinctUntilChanged, forkJoin, of, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { PointsService } from '../../core/points.service';
import { NotificationService } from '../../core/notification.service';

const emailPatter = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

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

  readonly isEditing = model<boolean>(false);
  readonly client = input<User>();

  protected emailTaken = false;
  protected usernameTaken = false;

  private minAgeValidator(minAge: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as string | null;
      if (!value) return null;

      const parts = value.split('-').map(Number);
      if (parts.length !== 3 || parts.some(n => Number.isNaN(n))) return { invalidDate: true };

      const [y, m, d] = parts;
      const birth = new Date(y, m - 1, d);
      if (Number.isNaN(birth.getTime())) return { invalidDate: true };

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (birth > today) return { futureDate: true };

      let age = today.getFullYear() - birth.getFullYear();
      const hasNotHadBirthdayThisYear =
        today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
      if (hasNotHadBirthdayThisYear) age--;

      return age >= minAge ? null : { minAge: true };
    };
  }

  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    birthDate: ['', [Validators.required, this.minAgeValidator(8)]],
    mail: this.formBuilder.nonNullable.control('', {
      validators: [Validators.required, Validators.email, Validators.pattern(emailPatter)],
      updateOn: 'blur',
    }),
    password: ['', Validators.required],
  });

  ngOnInit(): void {
    const u = this.client();

    if (this.isEditing() && u) {
      const birth = (u.birthDate ?? '').toString().slice(0, 10);

      this.form.patchValue({
        username: u.username ?? '',
        birthDate: birth,
        mail: u.mail ?? '',
        password: u.password ?? ''
      });

      this.form.controls.birthDate.disable({ emitEvent: false });
    } else {
      this.form.controls.birthDate.enable({ emitEvent: false });
    }

    this.form.controls.mail.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(raw => {
          const ctrl = this.form.controls.mail;
          const value = (raw ?? '').trim().toLowerCase();
          if (!value || ctrl.invalid) return of(false);

          const current = this.client();
          if (this.isEditing() && current?.mail?.trim().toLowerCase() === value) return of(false);

          return this.auth.existsEmail(value);
        })
      )
      .subscribe(exists => this.emailTaken = exists);

    this.form.controls.username.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(raw => {
          const value = (raw ?? '').trim();
          if (!value) return of(false);

          const current = this.client();
          if (this.isEditing() && current?.username?.trim().toLowerCase() === value.toLowerCase()) {
            return of(false);
          }

          return this.auth.existsUsername(value);
        })
      )
      .subscribe(exists => this.usernameTaken = exists);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.notify('El formulario es inválido.');
      return;
    }

    if (this.isEditing()) {
      const current = this.auth.activeUser();
      if (!current?.id) {
        this.notification.notify('No se encontró el usuario a editar');
        return;
      }
      const userId = current.id;

      const username = (this.form.controls.username.value ?? '').trim();
      const mail = (this.form.controls.mail.value ?? '').trim().toLowerCase();
      const password = this.form.controls.password.value ?? '';

      const oldUsername = (current.username ?? '').trim().toLowerCase();
      const oldMail = (current.mail ?? '').trim().toLowerCase();

      const usernameChanged = username.toLowerCase() !== oldUsername;
      const mailChanged = mail !== oldMail;

      const checkUsername$ = usernameChanged ? this.auth.existsUsername(username) : of(false);
      const checkEmail$ = mailChanged ? this.auth.existsEmail(mail) : of(false);

      forkJoin({ usernameExists: checkUsername$, emailExists: checkEmail$ }).pipe(
        switchMap(({ usernameExists, emailExists }) => {
          if (usernameExists) {
            this.notification.notify('Ese usuario ya existe.');
            return of(null);
          }
          if (emailExists) {
            this.notification.notify('Ese email ya está registrado.');
            return of(null);
          }

          const payload = {
            username,
            mail,
            password,
            avatar_url: this.avatarUrlFromUsername(username),
          };

          return this.users.updateUser(payload as any, userId);
        })
      ).subscribe({
        next: (res) => {
          if (!res) return;
          this.auth.activeUser.set(res);
          localStorage.setItem('activeUser', JSON.stringify(res));
          this.notification.notify('Perfil actualizado');
          this.isEditing.set(false);
        },
        error: (err) => {
          console.error('UPDATE ERROR BODY:', err.error);
          this.notification.notify(
            typeof err.error === 'string'
              ? err.error
              : err.error?.message || err.error?.error || 'No se pudo actualizar el perfil'
          );
        }
      });

      return;
    }

    const raw = this.form.getRawValue();
    const username = (raw.username ?? '').trim();
    const mail = (raw.mail ?? '').trim().toLowerCase();

    forkJoin({
      usernameExists: this.auth.existsUsername(username),
      emailExists: this.auth.existsEmail(mail),
    }).pipe(
      switchMap(({ usernameExists, emailExists }) => {
        if (usernameExists) {
          this.notification.notify('Ese usuario ya existe.');
          return of(null);
        }
        if (emailExists) {
          this.notification.notify('Ese email ya está registrado.');
          return of(null);
        }

        const puntos = this.points.randomPoints();

        const newUser: User = {
          ...raw,
          username,
          mail,
          avatar_url: this.avatarUrlFromUsername(username),
          points: puntos,
          login_dates: [new Date().toISOString()],
          last_team_created_at: null,
        };

        return this.users.addUser(newUser);
      })
    ).subscribe({
      next: (res) => {
        if (!res) return;

        const { user, token } = res;
        const puntos = user.points ?? 0;

        this.notification.notify(`Usuario registrado! Has recibido ${puntos} puntos de Bienvenida!`);

        this.auth.activeUser.set(user);
        localStorage.setItem('activeUser', JSON.stringify(user));
        localStorage.setItem('token', token);

        this.form.reset({ username: '', birthDate: '', mail: '', password: '' });
        this.emailTaken = false;
        this.usernameTaken = false;

        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        console.error('REGISTER ERROR BODY:', err.error);
        this.notification.notify(
          typeof err.error === 'string'
            ? err.error
            : err.error?.message || err.error?.error || 'No se pudo registrar el usuario'
        );
      }
    });
  }

  private fnv1aHash(str: string): number {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  private avatarUrlFromUsername(username: string): string {
    const seed = (username ?? '').trim().toLowerCase();
    const h = this.fnv1aHash(seed);

    const maxPokemon = 1010;
    const pokemonId = (h % maxPokemon) + 1;

    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
  }
}
