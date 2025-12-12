import { Routes } from '@angular/router';
import { LogIn } from './pages/log-in/log-in';
import { PokemonCatalog } from './pages/pokemon-catalog/pokemon-catalog';
import { SignIn } from './pages/sign-in/sign-in';
import { Profile } from './pages/profile/profile';
import { PokemonDetails } from './pages/pokemon-details/pokemon-details';
import { HomePage } from './pages/home-page/home-page';
import { Contact } from './pages/contact/contact';
import { UserTeams } from './pages/pokemon-teams/user-teams';
import { PokemonQuiz } from './pages/pokemon-quiz/pokemon-quiz';
import { authGuard } from './core/auth-guard';
import { guestGuard } from './core/guestGuard';
import { Leaderboard } from './pages/leaderboard/leaderboard';
import { PokeGuess } from './pages/poke-guess/poke-guess';

export const routes: Routes = [
    {
        path: '', redirectTo: 'home', pathMatch: 'full'
    }, {
        path: 'home', component: HomePage,
        title: 'Inicio'
    },
    {
        path: 'catalog', component: PokemonCatalog,
        title: 'Catalogo Pokemon'
    },
    {
        path: 'details/:name', component: PokemonDetails,
        title: 'Detalles de Pokémon'
    },
    {
        path: 'logIn', component: LogIn,
        title: 'Log In',
        canActivate: [guestGuard]

    },
    {
        path: 'signIn', component: SignIn,
        title: 'Sign In',
        canActivate: [guestGuard]
    },
    {
        path: 'profile', component: Profile,
        title: 'Perfil de Usuario',
        canActivate: [authGuard]


    },
    {
        path: 'edit-profile', component: Profile,
        title: 'Editar Perfil de Usuario',
        canActivate: [authGuard]

    },
    {
        path: 'teams', component: UserTeams,
        title: 'Mis Equipos',
        canActivate: [authGuard]

    },
    {
        path: 'contact', component: Contact,
        title: 'Contacto'
    },
    {
        path: 'quiz', component: PokemonQuiz,
        title: 'Quiz Pokemon'
    },
    {
      path: 'pokeguess', component: PokeGuess,
      title: 'Poke-Guess'
    },
    {
        path: 'leaderboard', component: Leaderboard,
        title: 'Leaderboard'
    },
    {
        path: '**', redirectTo: 'home'
    }
];
