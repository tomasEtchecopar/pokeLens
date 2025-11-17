import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PokemonAudioService {
  private currentAudio: HTMLAudioElement | null = null;
  private readonly isPlaying = signal(false);
  private readonly currentPokemonID = signal<number| null>(null);

  playCry(cryUrl: string | undefined, pokemonId?: number){
    if(!cryUrl){
      console.error('no cry available for url: ', cryUrl);
      return;
    }

    this.stopCurrentAudio();

    try{
      this.currentAudio = new Audio(cryUrl);
      this.currentAudio.volume = 0.5;

      this.currentAudio.addEventListener('play', () =>{
        this.isPlaying.set(true);
        if(pokemonId){
          this.currentPokemonID.set(pokemonId);
        }
      });

      this.currentAudio.addEventListener('ended', () =>{
        this.isPlaying.set(false);
        this.currentPokemonID.set(null);
      })

      this.currentAudio.addEventListener('error', (error) =>{
        console.error('error playing cry: ', error);
        this.isPlaying.set(false);
        this.currentPokemonID.set(null);
      })

      this.currentAudio.play().catch(error =>{
        console.error("error playing audio: ", error);
      })
    }catch(error){
      console.error('error creating audio: ', error);
    }
  }

  stopCurrentAudio(){
    if(this.currentAudio){
      this.currentAudio.pause();
      this.currentAudio.currentTime =0;
      this.currentAudio = null;
      this.isPlaying.set(false);
      this.currentPokemonID.set(null);
    }
  }

    isPlayingPokemon(pokemonId: number){
      return this.isPlaying() && this.currentPokemonID() === pokemonId;
    }

    toggleCry(cryUrl: string | undefined, pokemonId?: number){
      if(pokemonId && this.isPlayingPokemon(pokemonId)){
        this.stopCurrentAudio();
      }else{
        this.playCry(cryUrl, pokemonId);
      }
    }

    setVolume(volume: number){
      if(this.currentAudio){
        this.currentAudio.volume = Math.max(0, Math.min(1, volume));
      }
    }
}
