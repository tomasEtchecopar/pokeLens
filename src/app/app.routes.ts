import { Routes } from '@angular/router';
import { LogIn } from './pages/log-in/log-in';
import { PokemonCatalog } from './pages/pokemon-catalog/pokemon-catalog';
import { SignIn } from './pages/sign-in/sign-in';
import { Profile } from './pages/profile/profile';
import { PokemonDetails } from './pages/pokemon-details/pokemon-details';
import { HomePage } from './pages/home-page/home-page';
import { Contact } from './pages/contact/contact';
import { UserCollections } from './pages/profile/pokemon-collections/user-collections';
import { PokemonQuiz } from './pages/pokemon-quiz/pokemon-quiz';

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
        title: 'Mis Equipos'
    },

    {
        path: 'contact', component: Contact,
        title: 'Contacto'
    },{
      path: 'quiz', component: PokemonQuiz,
      title: 'Quiz Pokemon'
    },
    {
        path: '**', redirectTo: 'catalogo'
    }
    //mas adelante agregar rutas de log in, etc
];
