
export interface PointEvent {
  id?: string,
  amount: number;
  reason: string;
  created_at: string;
}

export interface User {
  id?: string;
  username: string;
  mail: string;
  password: string;
  birthDate: string
  points?: number;
  avatar_url?: string;
  login_dates: string[]; // Array de fechas
  last_team_created_at?: string | null;
  created_at?: string;
}
