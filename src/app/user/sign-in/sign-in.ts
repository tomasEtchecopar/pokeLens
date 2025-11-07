import { Component, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../user-model';
import { UserClient } from '../../core/sign-in.service';

@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {

  private readonly users: UserClient = inject(UserClient);
  private readonly formBuilder = inject(FormBuilder);
  readonly isEditing = input(false);
  readonly client = input<User>();

  protected readonly form = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    age: [8, [Validators.required, Validators.min(8)]],
    mail: ['', Validators.required],
    password: ['', Validators.required]
  });
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


  onSubmit() {
    if (this.form.invalid) {
      alert("El formulario es inválido.");
      return;
    }

    if (confirm("Desea confirmar los datos?")) {
      const userForm = this.form.getRawValue();

      const usernameKey = userForm.username.trim().toLowerCase();
      const pokemonId = this.hashToPokemonId(usernameKey);
      const avatarUrl = this.pokemonArtworkUrl(pokemonId);

      const newUser: User = {
        ...userForm,
        pokemonId,
        avatarUrl
      };


      this.users.addUser(newUser).subscribe({
        next: () => {
          alert('User registered!');
          this.form.reset({ username: '', age: 8, mail: '', password: '' });
        },
        error: (err) => {
          console.error(err);
          alert('No se pudo registrar el usuario.');
        }
      });
    }
  }

  //Genera un ID de Pokémon aleatorio para el avatar del usuario
  randomPokemonId(max = 1025) {
    return Math.floor(Math.random() * max) + 1;
  }
}
