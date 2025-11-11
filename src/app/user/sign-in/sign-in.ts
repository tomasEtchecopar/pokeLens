import { Component, inject, input, model, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../user-model';
import { UserClient } from '../../core/sign-in.service';
import { AuthServ } from '../../core/auth.service';

@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn implements OnInit {
  //Servicios
  private readonly users: UserClient = inject(UserClient);
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthServ);
  //Inputs
  readonly isEditing = model<boolean>(false);
  readonly client = input<User>();

  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    age: [8, [Validators.required, Validators.min(8)]],
    mail: ['', Validators.required],
    password: ['', Validators.required]
  });

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
  }




  onSubmit() {
    if (this.form.invalid) { alert('El formulario es inválido.');return;}

    const datosUser = this.form.getRawValue();

    //  EDITAR PERFIL
    if (this.isEditing()) {
      const current = this.client();
      if (!current?.id) {alert('No se encontró el usuario a editar');return;}

      const updated: User = { ...current, ...datosUser, id: current.id };

      this.users.updateUser(updated, current.id).subscribe({ 
       // sincronizar sesión para que header/profile se actualicen
        next: (res) => {
          this.auth.activeUser.set(res);
          localStorage.setItem('activeUser', JSON.stringify(res));
          alert('Perfil actualizado');
          this.isEditing.set(false);
        },
        error: (err) => { console.error(err); alert('No se pudo actualizar el perfil');}
      });

    } else {
      //  REGISTRO 
      const usernameKey = datosUser.username.trim().toLowerCase();
      const pokemonId = this.hashToPokemonId(usernameKey);
      const avatarUrl = this.pokemonArtworkUrl(pokemonId);

      const newUser: User = { ...datosUser, pokemonId, avatarUrl };

      this.users.addUser(newUser).subscribe({
        next: () => {
          alert('Usuario registrado');
          this.form.reset({ username: '', age: 8, mail: '', password: '' });
        },
        error: (err) => {
          console.error(err);
          alert('No se pudo registrar el usuario');
        }
      });
    }
  }


  /** Mapear username -> pokemonId (fijo) */
  private hashToPokemonId(text: string, max = 1025): number {
    let h = 0;
    for (let i = 0; i < text.length; i++) {
      h = ((h << 5) - h) + text.charCodeAt(i) | 0;
    }
    h = Math.abs(h);
    return (h % max) + 1; // 1..max
  }

  private pokemonArtworkUrl(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  }
  //Genera un ID de Pokémon aleatorio para el avatar del usuario
  randomPokemonId(max = 1025) {
    return Math.floor(Math.random() * max) + 1;
  }
}
