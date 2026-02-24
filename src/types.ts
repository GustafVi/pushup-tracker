export interface WorkoutSet {
  id: string;
  date: string;        // "YYYY-MM-DD"
  exercise: string;    // "pushups" | "squats" | "plank"
  reps: number;
  createdAt: string;   // ISO timestamp
}

export interface WorkoutSession {
  id: string;
  date: string;          // "YYYY-MM-DD"
  durationSeconds: number;
  createdAt: string;     // ISO timestamp
}

export interface SessionSummary {
  durationSeconds: number;
  sets: WorkoutSet[];
}

export type Tab = 'log' | 'history' | 'progress';
