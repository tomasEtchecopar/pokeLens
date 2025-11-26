import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/enviroment';
import { Observable } from 'rxjs';

export interface LeaderboardEntry {
  position: number;
  id: string;
  username: string;
  points: number;
  avatar_url?: string;
  last_login_date?: string;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  total: number;
  limit: number;
  offset: number;
  timeframe: string;
  page: number;
}

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/leaderboard`;

  getLeaderboard(limit = 10, offset = 0, timeframe = 'all'): Observable<LeaderboardResponse> {
    const params: any = { limit: String(limit), offset: String(offset), timeframe };
    return this.http.get<LeaderboardResponse>(this.base, { params });
  }

  getStats() {
    return this.http.get(`${this.base}/stats`);
  }

  getUserPosition(userId: string, timeframe = 'all') {
    return this.http.get(`${this.base}/user/${userId}`, { params: { timeframe } });
  }
}
