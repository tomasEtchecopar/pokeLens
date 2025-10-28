import { Component, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../clientTemplate';
import { Client } from '../client';

@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {

  private readonly user = inject(Client);
  private readonly formBuilder = inject(FormBuilder);
  readonly isEditing = input(false);
  readonly client = input<User>();

  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    age: [8, [Validators.required, Validators.min(8)]],
    mail: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit(){
    if(this.form.invalid){
      alert("El formulario es inválido.");
    }

    if(confirm("Desea confirmar los datos?")){
      const userForm = this.form.getRawValue();

      this.user.addClient(userForm).subscribe(() => {
      alert("User registered!");
        console.log(this.user);
        this.form.reset();
      });
    }
  }
}
