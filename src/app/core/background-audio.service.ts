import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BackgroundAudioService {
  private bgm: HTMLAudioElement | null = null;
  private volume = 0.35;
  private bgmSrc: string | null = null;

  /* ===== background music ===== */
  playBackground(src = 'assets/sounds/memory.mp3') {
    if (this.bgm && this.bgmSrc === src) return;

    this.stopBackground();

    this.bgmSrc = src;
    this.bgm = new Audio(src);
    this.bgm.loop = true;
    this.bgm.preload = 'auto';
    this.bgm.volume = this.volume;
    this.bgm.play().catch(() => { });
  }


  stopBackground() {
    if (!this.bgm) return;
    this.bgm.pause();
    this.bgm.currentTime = 0;
    this.bgm = null;
    this.bgmSrc = null;
  }

  /* ===== volume ===== */
  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.bgm) this.bgm.volume = this.volume;
  }

  getVolume() {
    return this.volume;
  }

  /* ===== effects ===== */
  private play(src: string, baseVolume = 1) {
    if (this.volume === 0) return;

    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = this.volume * baseVolume;
    audio.play().catch(() => { });
  }

  match() {
    this.play('assets/sounds/match.mp3', 1);
  }

  error() {
    this.play('assets/sounds/error.mp3', 0.9);
  }

  /* ===== WIN ===== */
  playWin() {
    this.stopBackground();

    const win = new Audio('assets/sounds/win.mp3');
    win.preload = 'auto';
    win.volume = this.volume;
    win.play().catch(() => { });
  }


  private trackBag: string[] = [];

  /** Reproduce un tema al azar de una lista, sin repetir hasta agotar */
  playBackgroundRandom(tracks: readonly string[], fallback = 'assets/sounds/memory.mp3') {
    const src = this.pickRandomTrack(tracks, fallback);
    this.playBackground(src);
  }

  private pickRandomTrack(tracks: readonly string[], fallback: string) {
    if (!tracks || tracks.length === 0) return fallback;

    if (!this.trackBag.length) {
      // recargar y mezclar (shuffle-bag)
      this.trackBag = [...tracks].sort(() => Math.random() - 0.5);
    }

    return this.trackBag.pop()!;
  }


}
