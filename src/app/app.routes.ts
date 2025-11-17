import { Routes } from '@angular/router';
import { LogIn } from './user/log-in/log-in';
import { PokemonCatalog } from './pages/pokemon-catalog/pokemon-catalog';
import { SignIn } from './user/sign-in/sign-in';
import { Profile } from './user/profile/profile';
import { PokemonDetails } from './pages/pokemon-details/pokemon-details';
import { HomePage } from './pages/home-page/home-page';
import { PokemonCollections } from './pages/pokemon-collections/pokemon-collections';
import { Contact } from './pages/contact/contact';
import { UserCollections } from './user/profile/user-collections/user-collections';

export const routes: Routes = [
    {
        path: '', redirectTo: 'home', pathMatch: 'full'
    }, {
        path: 'home', component: HomePage,
        title: 'Inicio'
    },
    {
        path: 'catalogo', component: PokemonCatalog,
        title: 'Catalogo Pokemon'
    },
    {
        path: 'details/:name', component: PokemonDetails,
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
        path: 'profile', component: Profile,
        title: 'Perfil de Usuario'

    },
    {
        path: 'edit-profile', component: Profile,
        title: 'Editar Perfil de Usuario'
    },
    {
        path: 'collections', component: UserCollections,
        title: 'Mis Colecciones'
    },

    {
        path: 'contact', component: Contact,
        title: 'Contacto'
    },
    {
        path: '**', redirectTo: 'catalogo'
    }
    //mas adelante agregar rutas de log in, etc
];
