import { Routes } from '@angular/router';
import { LogIn } from './pages/log-in/log-in';
import { PokemonCatalog } from './pages/pokemon-catalog/pokemon-catalog';
import { SignIn } from './pages/sign-in/sign-in';
import { Profile } from './pages/profile/profile';
import { PokemonDetails } from './pages/pokemon-details/pokemon-details';
import { HomePage } from './pages/home-page/home-page';
import { UserTeams } from './pages/pokemon-teams/user-teams';
import { Contact } from './pages/about/contact/contact';
import { PokemonQuiz } from './pages/pokemon-quiz/pokemon-quiz';
import { authGuard } from './core/auth-guard';
import { guestGuard } from './core/guestGuard';
import { Leaderboard } from './pages/leaderboard/leaderboard';
import { PokeGuess } from './pages/poke-guess/poke-guess';
import { MemoryGame } from './pages/memory-game/memory-game';

export const routes: Routes = [
  {
    path: '', redirectTo: 'home', pathMatch: 'full'
  },
  {
    path: '',
    children: [
      {
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
        path: 'memory',
        component: MemoryGame,
        title: 'Memotest Pokémon',
      },
      {
        path: 'about',
        children: [
          {
            path: 'contact', component: Contact,
            title: 'Contacto',
          },
          {
            path: 'terms', component: Terms,
            title: 'Términos y Condiciones'
          },
          {
            path: 'privacy', component: Privacy,
            title: 'Política de Privacidad'
          }
        ]
      },
    ]
  },
  {
    path: '',
    canActivateChild: [guestGuard],
    children: [
  {
    path: 'logIn', component: LogIn,
    title: 'Log In',

  },
  {
    path: 'signIn', component: SignIn,
    title: 'Sign In',
  },
    ]
  },
  {
    path: 'user',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [

  {
    path: 'profile', component: Profile,
    title: 'Perfil de Usuario',


  },
  {
    path: 'profile/edit', component: Profile,
    title: 'Editar Perfil de Usuario',

  },
  {
    path: 'teams', component: UserTeams,
    title: 'Mis Equipos',

  },
    ]
  },
  {
    path: '**', redirectTo: 'home'
  }
];
