import { Component, computed, effect, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServ } from '../../core/auth.service';
import { TeamService } from '../../core/team.service';
import { PokemonCard } from '../../pokemon/pokemon-card/pokemon-card';
import { Pokemon } from '../../pokemon/models/pokemon-models';
import { FormsModule } from '@angular/forms';
import { Team } from './team-model';
import { catchError, forkJoin, map, of } from 'rxjs';
import { PokemonService } from '../../pokemon/pokemon-service';
import { NotificationService } from '../../core/notification.service';
import { ConfirmModalComponent } from '../../components/notification-modal/notification-menu-modal';
import { EditNicknameModalComponent } from './edit-nickname-modal';

/**
 * UserTeams manages the user's pokemon teams.
 * Uses normalized database structure with Team and TeamPokemon models.
 */
@Component({
  selector: 'app-user-teams',
  standalone: true,
  imports: [PokemonCard, FormsModule, ConfirmModalComponent, EditNicknameModalComponent],
  templateUrl: './user-teams.html',
  styleUrl: './user-teams.css',
})
export class UserTeams implements OnInit {
  private readonly auth = inject(AuthServ);
  private readonly teamService = inject(TeamService);
  private readonly pokemonService = inject(PokemonService);
  protected readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  // Team name editing state
  editingTeamId = signal<string | null>(null);
  editingName = signal<string>('');

  usuario = computed(() => this.auth.activeUser());

  // Teams from API
  teams = signal<Team[]>([]);

  private readonly pokemonCache = signal(new Map<number, Pokemon>());
  // Track IDs currently being fetched to avoid duplicate requests
  private readonly fetchingIds = new Set<number>();

  // Average power per team
  private readonly _teamAverages = signal<number[]>([]);
  teamAverages = computed(() => this._teamAverages());

  //Señales para los modales de eliminar pokemon o Equipo
  confirmOpen = signal(false);
  confirmTitle = signal('Confirmar');
  confirmMessage = signal('¿Seguro?');
  confirmCta = signal('Aceptar');
  cancelCta = signal('Cancelar');

  private pendingConfirmAction: (() => void) | null = null;

  //Señales para editar apodo al pokemon
  nicknameOpen = signal(false);
  nicknameTargetId = signal<string | null>(null);
  nicknameInitial = signal('');
  nicknameTitle = signal('Editar apodo');
  nicknameMsg = signal('Ingresá el nuevo apodo');



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
        this.notification.notify('Error al cargar los equipos');
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
        this.notification.notify('Error al crear el equipo');
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
    const missingAll = Array.from(needed).filter(id => !cache.has(id));
    // filter out ids already being fetched
    const missing = missingAll.filter(id => !this.fetchingIds.has(id));
    if (missing.length === 0) return;

    // mark as fetching
    missing.forEach(id => this.fetchingIds.add(id));

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
        // clear fetching flags
        missing.forEach(id => this.fetchingIds.delete(id));
        if (fetched.length === 0) return;
        const newMap = new Map<number, Pokemon>(this.pokemonCache());
        fetched.forEach(p => newMap.set(p.id as number, p));
        this.pokemonCache.set(newMap);
      },
      error: err => {
        // clear fetching flags on error
        missing.forEach(id => this.fetchingIds.delete(id));
        console.error('Prefetch error', err)
      }
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

      // Filter out IDs that are already being fetched
      const toFetch = uniqueMissing.filter(id => !this.fetchingIds.has(id));
      if (toFetch.length > 0) {
        // mark as fetching
        toFetch.forEach(id => this.fetchingIds.add(id));

        forkJoin(
          toFetch.map(id =>
            this.pokemonService.getPokemonById(id).pipe(catchError(() => of(null)))
          )
        ).pipe(map(arr => arr.filter((p): p is Pokemon => !!p)))
          .subscribe({
            next: fetched => {
              // remove from fetching set
              toFetch.forEach(id => this.fetchingIds.delete(id));
              if (fetched.length === 0) return;
              const newMap = new Map<number, Pokemon>(this.pokemonCache());
              fetched.forEach(p => newMap.set(p.id as number, p));
              this.pokemonCache.set(newMap);
            },
            error: err => {
              // ensure we clear fetching flags on error
              toFetch.forEach(id => this.fetchingIds.delete(id));
              console.error('Error cargando pokemons faltantes', err)
            }
          });
      }
    }

    return results;
  }

  /**
   * Elimina un equipo
   */
  deleteTeam(teamId: string, teamName?: string) {
    this.openConfirm(
      {
        title: 'Eliminar equipo',
        message: `¿Seguro que quieres eliminarlo?`,
        confirmText: 'Sí, eliminar',
        cancelText: 'Cancelar',
      },
      () => {
        this.teamService.deleteTeam(teamId).subscribe({
          next: () => this.loadTeams(),
          error: (err) => {
            console.error('Error eliminando equipo:', err);
            this.notification.notify('Error al eliminar el equipo');
          },
        });
      }
    );
  }


  /**
   * Elimina un pokemon de un equipo
   */
  deletePokemon(teamPokemonId: string, pokemonName?: string, nickname?: string | null) {
    const label = (nickname?.trim() ? nickname : pokemonName) ?? 'este Pokémon';

    this.openConfirm(
      {
        title: 'Quitar Pokémon',
        message: `¿Deseas quitar "${label}" del equipo?`,
        confirmText: 'Quitar',
        cancelText: 'Cancelar',
      },
      () => {
        this.teamService.removePokemon(teamPokemonId).subscribe({
          next: () => this.loadTeams(),
          error: (err) => {
            console.error('Error eliminando pokemon:', err);
            this.notification.notify('Error al eliminar el Pokémon del equipo');
          },
        });
      }
    );
  }



  /**
   * Edita el nickname de un pokemon
   */
  editNickname(teamPokemonId: string, currentNickname?: string | null, pokemonName?: string) {
    this.nicknameTargetId.set(teamPokemonId);
    this.nicknameInitial.set(currentNickname ?? '');
    this.nicknameTitle.set('Editar apodo');
    this.nicknameMsg.set(`Nuevo apodo para ${pokemonName ? `"${pokemonName}"` : 'el Pokémon'}`);
    this.nicknameOpen.set(true);
  }

  onNicknameCancel() {
    this.nicknameOpen.set(false);
    this.nicknameTargetId.set(null);
  }

  onNicknameSave(newNickname: string) {
    const id = this.nicknameTargetId();
    if (!id) return;

    const trimmed = (newNickname ?? '').trim();
    if (trimmed.length > 32) {
      this.notification.notify('El nickname no puede exceder 32 caracteres');
      return;
    }

    this.teamService.updatePokemonNickname(id, trimmed).subscribe({
      next: () => {
        this.nicknameOpen.set(false);
        this.nicknameTargetId.set(null);
        this.loadTeams();
      },
      error: (err) => {
        console.error('Error al editar apodo:', err);
        this.notification.notify('Error al editar el apodo del Pokémon');
        this.nicknameOpen.set(false);
        this.nicknameTargetId.set(null);
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
      this.notification.notify('El nombre no puede estar vacío');
      return;
    }

    this.teamService.updateTeamName(teamId, name).subscribe({
      next: () => {
        this.editingTeamId.set(null);
        this.loadTeams();
      },
      error: (err) => {
        console.error('Error al guardar nombre:', err);
        this.notification.notify('Error al guardar el nombre del equipo');
        this.editingTeamId.set(null);
      }
    });
  }

  //modales

  openConfirm(
    opts: { title: string; message: string; confirmText?: string; cancelText?: string },
    action: () => void
  ) {
    this.confirmTitle.set(opts.title);
    this.confirmMessage.set(opts.message);
    this.confirmCta.set(opts.confirmText ?? 'Aceptar');
    this.cancelCta.set(opts.cancelText ?? 'Cancelar');
    this.pendingConfirmAction = action;
    this.confirmOpen.set(true);
  }

  onConfirmYes() {
    this.pendingConfirmAction?.();
    this.pendingConfirmAction = null;
    this.confirmOpen.set(false);
  }

  onConfirmNo() {
    this.pendingConfirmAction = null;
    this.confirmOpen.set(false);
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
    this.router.navigateByUrl('/user/profile');
  }

  goToCatalog() {
    this.router.navigateByUrl('/catalog');
  }
}
