import { Component, computed, effect, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServ } from '../../core/auth.service';
import { TeamService } from '../../core/team.service';
import { PokemonCard } from '../../pokemon/pokemon-card/pokemon-card';
import { Pokemon } from '../../pokemon/models/pokemon-models';
import { FormsModule } from '@angular/forms';
import { Team } from './team-model';
import { catchError, forkJoin, map, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PokemonService } from '../../pokemon/pokemon-service';

/**
 * UserTeams manages the user's pokemon teams.
 * Uses normalized database structure with Team and TeamPokemon models.
 */
@Component({
  selector: 'app-user-teams',
  standalone: true,
  imports: [PokemonCard, FormsModule],
  templateUrl: './user-teams.html',
  styleUrl: './user-teams.css',
})
export class UserTeams implements OnInit {
  private readonly auth = inject(AuthServ);
  private readonly teamService = inject(TeamService);
  private readonly pokemonService = inject(PokemonService);
  protected readonly router = inject(Router);

  // Team name editing state
  editingTeamId = signal<string | null>(null);
  editingName = signal<string>('');

  usuario = computed(() => this.auth.activeUser());

  // Teams from API
  teams = signal<Team[]>([]);

  private readonly pokemonCache = signal(new Map<number, Pokemon>());

  // Average power per team
  private readonly _teamAverages = signal<number[]>([]);
  teamAverages = computed(() => this._teamAverages());

  ngOnInit(): void {
    this.loadTeams();
  }

  constructor() {
   // Recalcular promedios cuando cambian equipos o cache
    effect(() => {
      const teams = this.teams();
      // Dependencia explícita a cache para re-evaluar cuando llegan pokemons
      const cacheSnapshot = this.pokemonCache();

      if (!teams || teams.length === 0) {
        this._teamAverages.set([]);
        return;
      }

      // Para cada equipo calculamos promedio con lo que haya en cache
      const averages: number[] = teams.map(team => {
        if (!team.pokemons || team.pokemons.length === 0) return 0;

        const pokemons: Pokemon[] = team.pokemons
          .map(entry => {
            const idNum = Number(entry.pokemon_id);
            return cacheSnapshot.get(idNum);
          })
          .filter((p): p is Pokemon => !!p);

        if (pokemons.length === 0) return 0;

        const powers = pokemons.map(pk =>
          (pk.stats ?? []).reduce((acc, s) => acc + (s.base_stat ?? 0), 0)
        );

        const sum = powers.reduce((a, b) => a + b, 0);
        const avg = sum / powers.length;
        return Number(avg.toFixed(2));
      });

      this._teamAverages.set(averages);
    });
}

  /**
   * Carga los equipos del usuario
   */
  loadTeams() {
    const user = this.usuario();
    if (!user || !user.id) return;

    this.teamService.getUserTeams().subscribe({
      next: (teams) => {
        this.teams.set(teams);
        this.prefetchTeamPokemonIds(teams);
      },
      error: (err) => {
        console.error('Error cargando equipos:', err);
        alert('Error al cargar los equipos');
      }
    });
  }

  /**
   * Crea un nuevo equipo
   */
  createTeam() {
    this.teamService.createTeam().subscribe({
      next: () => {
        this.loadTeams();
      },
      error: (err) => {
        console.error('Error creando equipo:', err);
        alert('Error al crear el equipo');
      }
    });
  }

   /**
   * Prefetch: trae en background pokemons que no estén en cache
   */
  private prefetchTeamPokemonIds(teams: Team[]) {
    const needed = new Set<number>();
    teams.forEach(t => t.pokemons?.forEach(tp => {
      const idNum = Number(tp.pokemon_id);
      if (!Number.isNaN(idNum)) needed.add(idNum);
    }));

    const cache = this.pokemonCache();
    const missing = Array.from(needed).filter(id => !cache.has(id));
    if (missing.length === 0) return;

    // Usar pokemonService.getPokemonById para cada id
    forkJoin(
      missing.map(id =>
        this.pokemonService.getPokemonById(id).pipe(
          catchError(() => of(null))
        )
      )
    ).pipe(
      map(arr => arr.filter((p): p is Pokemon => !!p))
    ).subscribe({
      next: fetched => {
        if (fetched.length === 0) return;
        const newMap = new Map<number, Pokemon>(this.pokemonCache());
        fetched.forEach(p => newMap.set(p.id as number, p));
        this.pokemonCache.set(newMap);
      },
      error: err => console.error('Prefetch error', err)
    });
  }

  /**
   * Obtiene los pokemon completos de un equipo
   */
   getTeamPokemons(team: Team): Pokemon[] {
    const cache = this.pokemonCache();
    const idsToFetch: number[] = [];

    const results: Pokemon[] = (team.pokemons ?? [])
      .map(tp => {
        const idNum = Number(tp.pokemon_id);
        const p = cache.get(idNum);
        if (!p) idsToFetch.push(idNum);
        return p;
      })
      .filter((p): p is Pokemon => !!p);

    if (idsToFetch.length > 0) {
      const uniqueMissing = Array.from(new Set(idsToFetch));
      forkJoin(
        uniqueMissing.map(id =>
          this.pokemonService.getPokemonById(id).pipe(catchError(() => of(null)))
        )
      ).pipe(map(arr => arr.filter((p): p is Pokemon => !!p)))
        .subscribe({
          next: fetched => {
            if (fetched.length === 0) return;
            const newMap = new Map<number, Pokemon>(this.pokemonCache());
            fetched.forEach(p => newMap.set(p.id as number, p));
            this.pokemonCache.set(newMap);
          },
          error: err => console.error('Error cargando pokemons faltantes', err)
        });
    }

    return results;
  }

  /**
   * Elimina un equipo
   */
  deleteTeam(teamId: string) {
    if (!confirm('¿Seguro que quieres eliminar este equipo?')) return;

    this.teamService.deleteTeam(teamId).subscribe({
      next: () => {
        this.loadTeams();
      },
      error: (err) => {
        console.error('Error eliminando equipo:', err);
        alert('Error al eliminar el equipo');
      }
    });
  }

  /**
   * Elimina un pokemon de un equipo
   */
  deletePokemon(pokemonId: string) {
    if (!confirm('¿Seguro que desea eliminar al Pokemon del equipo?')) return;

    this.teamService.removePokemon(pokemonId).subscribe({
      next: () => {
        this.loadTeams();
      },
      error: (err) => {
        console.error('Error eliminando pokemon:', err);
        alert('Error al eliminar el Pokémon del equipo');
      }
    });
  }

  /**
   * Edita el nickname de un pokemon
   */
  editNickname(pokemonId: string, currentNickname?: string | null) {
    const nickname = prompt('Nuevo apodo para el Pokémon:', currentNickname || '');

    if (nickname === null) return; // User cancelled

    const trimmed = nickname.trim();
    if (trimmed.length > 32) {
      alert('El nickname no puede exceder 32 caracteres');
      return;
    }

    this.teamService.updatePokemonNickname(pokemonId, trimmed).subscribe({
      next: () => {
        this.loadTeams();
      },
      error: (err) => {
        console.error('Error al editar apodo:', err);
        alert('Error al editar el apodo del Pokémon');
      }
    });
  }

  /**
   * Inicia edición del nombre del equipo
   */
  startEditingName(teamId: string, currentName: string) {
    this.editingTeamId.set(teamId);
    this.editingName.set(currentName);
  }

  /**
   * Guarda el nombre del equipo
   */
  saveTeamName(teamId: string) {
    const name = this.editingName().trim();

    if (!name) {
      alert('El nombre no puede estar vacío');
      return;
    }

    this.teamService.updateTeamName(teamId, name).subscribe({
      next: () => {
        this.editingTeamId.set(null);
        this.loadTeams();
      },
      error: (err) => {
        console.error('Error al guardar nombre:', err);
        alert('Error al guardar el nombre del equipo');
        this.editingTeamId.set(null);
      }
    });
  }

  /**
   * Cancela la edición
   */
  cancelEdit() {
    this.editingTeamId.set(null);
  }

  onNameInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.editingName.set(value);
  }

  backToProfile() {
    this.router.navigateByUrl('/profile');
  }

  goToCatalog() {
    this.router.navigateByUrl('/catalogo');
  }
}
