import { Routes } from '@angular/router';
import { PokemonCatalog } from './pokemon/pokemon-catalog/pokemon-catalog';
import { LogIn } from './user/log-in/log-in';
import { SignIn } from './user/sign-in/sign-in';

export const routes: Routes = [
    {
        path: '', redirectTo: 'catalogo', pathMatch: 'full'
    },
    {
        path: 'catalogo', component: PokemonCatalog,
        title: 'Catalogo Pokemon'
    },
    {
        path: 'catalogo/:id', component: PokemonCatalog, //aca va PokemonDetails (SEBA)
        title: 'Detalles de Pokémon' //eventualmente cambiar a nombre de pokemon
    },
    {
        path: 'logIn', component: LogIn,
        title: 'Log In'
    },
    {
        path: 'signIn', component: SignIn,
        title: 'Sign In'
    },
    {
        path: '**', redirectTo: 'catalogo'
    }
    //mas adelante agregar rutas de log in, etc
];
