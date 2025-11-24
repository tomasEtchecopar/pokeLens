import { Component, computed, effect, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthServ } from '../../core/auth.service';
import { PokemonListService } from '../../pokemon/pokemon-list-service';
import { TeamService } from '../../core/team.service';
import { PokemonCard } from '../../pokemon/pokemon-card/pokemon-card';
import { Pokemon } from '../../pokemon/models/pokemon-models';
import { Team } from '../../user/user-model';
import { FormsModule } from '@angular/forms';

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
  readonly pkmList = inject(PokemonListService);
  private readonly router = inject(Router);

  // Team name editing state
  editingTeamId = signal<string | null>(null);
  editingName = signal<string>('');

  usuario = computed(() => this.auth.activeUser());

  // Teams from API
  teams = signal<Team[]>([]);

  // Average power per team
  private readonly _teamAverages = signal<number[]>([]);
  teamAverages = computed(() => this._teamAverages());

  ngOnInit(): void {
    this.loadTeams();
  }

  constructor() {
    // Recalculate averages when teams change
    effect(() => {
      const teams = this.teams();

      if (!teams || teams.length === 0) {
        this._teamAverages.set([]);
        return;
      }

      const allPokemon = this.pkmList.allPokemon();
      const averages: number[] = [];

      teams.forEach(team => {
        if (!team.pokemons || team.pokemons.length === 0) {
          averages.push(0);
          return;
        }

        // Convert team pokemon to full Pokemon objects
        const pokemons: Pokemon[] = team.pokemons
          .map(entry => {
            const idNum = entry.pokemon_id;
            return allPokemon.find(p => p.id === idNum);
          })
          .filter((p): p is Pokemon => !!p);

        if (pokemons.length === 0) {
          averages.push(0);
          return;
        }

        // Calculate total base stats for each pokemon
        const powers = pokemons.map(pk =>
          (pk.stats ?? []).reduce((acc, s) => acc + (s.base_stat ?? 0), 0)
        );

        const sum = powers.reduce((a, b) => a + b, 0);
        const avg = sum / powers.length;

        averages.push(Number(avg.toFixed(2)));
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
  editNickname(pokemonId: string, currentNickname?: string) {
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
