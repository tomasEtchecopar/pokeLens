import { Routes } from '@angular/router';
import { PokemonCatalog } from './pokemon/pokemon-catalog/pokemon-catalog';

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
        path: '**', redirectTo: 'catalogo'
    }
    //mas adelante agregar rutas de log in, etc
];
