import { Component, inject, OnInit, signal } from '@angular/core';
import { LeaderboardService, LeaderboardEntry } from '../../core/leaderboard.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css'
})
export class Leaderboard implements OnInit {
  private readonly service = inject(LeaderboardService);

  leaderboard = signal<LeaderboardEntry[]>([]);
  limit = signal(10);
  offset = signal(0);
  total = signal(0);
  timeframe = signal<'all' | 'week' | 'month'>('all');
  isLoading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.isLoading.set(true);
    this.service.getLeaderboard(this.limit(), this.offset(), this.timeframe()).subscribe({
      next: (res) => {
        this.leaderboard.set(res.leaderboard);
        this.total.set(res.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  prev() {
    const newOffset = Math.max(0, this.offset() - this.limit());
    this.offset.set(newOffset);
    this.load();
  }

  next() {
    const newOffset = this.offset() + this.limit();
    if (newOffset >= this.total()) return;
    this.offset.set(newOffset);
    this.load();
  }

  changeTimeframe(event: Event | string) {
    let tf: string;
    if (typeof event === 'string') tf = event;
    else tf = (event.target as HTMLSelectElement)?.value || 'all';

    if (tf !== 'all' && tf !== 'week' && tf !== 'month') tf = 'all';

    this.timeframe.set(tf as 'all' | 'week' | 'month');
    this.offset.set(0);
    this.load();
  }

  getVisibleStart() {
    return this.offset() + 1;
  }

  getVisibleEnd() {
    const end = this.offset() + this.limit();
    return Math.min(end, this.total());
  }
}
