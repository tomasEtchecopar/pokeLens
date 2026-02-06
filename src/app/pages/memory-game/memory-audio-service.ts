import { Injectable } from '@angular/core';

@Injectable()
export class MemoryAudioService {
  private bgm: HTMLAudioElement | null = null;
  private volume = 0.35;

  /* ===== background music ===== */
  playBackground() {
    if (this.bgm) return;

    this.bgm = new Audio('assets/sounds/memory.mp3');
    this.bgm.loop = true;
    this.bgm.preload = 'auto';   
    this.bgm.volume = this.volume;
    this.bgm.play().catch(() => {});
  }

  stopBackground() {
    if (!this.bgm) return;
    this.bgm.pause();
    this.bgm.currentTime = 0;
    this.bgm = null;
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
    audio.play().catch(() => {});
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
    win.play().catch(() => {});
  }
}
