import { Component, inject, input, model, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../user/user-model';
import { UserClient } from '../../../core/user-client.service';
import { AuthServ } from '../../../core/auth.service';
import { NotificationService } from '../../../core/notification.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile implements OnInit {
  private readonly users = inject(UserClient);
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthServ);
  private readonly notification = inject(NotificationService);

  readonly isEditing = model<boolean>(false);
  readonly client = input<User | undefined>();

  protected readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    mail: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    const u = this.client();
    if (u) {
      this.form.patchValue({
        username: u.username ?? '',
        mail: u.mail ?? '',
      });
    }
  }

  cancel() {
    this.isEditing.set(false);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.notify('El formulario es inválido.');
      return;
    }

    const current = this.auth.activeUser();
    if (!current?.id) {
      this.notification.notify('No se encontró el usuario a editar');
      return;
    }

    // Mandamos SOLO lo permitido (sin points, sin avatar_url, sin password)
    const payload = {
      username: (this.form.controls.username.value ?? '').trim().toLowerCase(),
      mail: (this.form.controls.mail.value ?? '').trim().toLowerCase(),
    };

    this.users.updateUser(payload as any, current.id).subscribe({
      next: (res: User) => {
        this.auth.activeUser.set(res);
        localStorage.setItem('activeUser', JSON.stringify(res));
        this.notification.notify('Perfil actualizado');
        this.isEditing.set(false);
      },
      error: (err: any) => {
        console.error('UPDATE ERROR:', err?.error || err);
        this.notification.notify(
          typeof err?.error === 'string'
            ? err.error
            : err?.error?.message || err?.error?.error || 'No se pudo actualizar el perfil'
        );
      }
    });
  }
}
