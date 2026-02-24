import { useState, useMemo } from 'react';
import type { WorkoutSet, WorkoutSession } from '../types';

interface Props {
  sets: WorkoutSet[];
  sessions: WorkoutSession[];
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

interface DayGroup {
  date: string;
  sets: WorkoutSet[];
  session: WorkoutSession | undefined;
  byExercise: Record<string, { total: number; count: number }>;
}

export function History({ sets, sessions }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const sessionMap = useMemo(() => {
    const map: Record<string, WorkoutSession> = {};
    for (const s of sessions) map[s.date] = s;
    return map;
  }, [sessions]);

  const days: DayGroup[] = useMemo(() => {
    const grouped: Record<string, WorkoutSet[]> = {};
    for (const s of sets) {
      (grouped[s.date] ??= []).push(s);
    }
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, daySets]) => {
        const byExercise: Record<string, { total: number; count: number }> = {};
        for (const s of daySets) {
          const entry = (byExercise[s.exercise] ??= { total: 0, count: 0 });
          entry.total += s.reps;
          entry.count += 1;
        }
        return { date, sets: daySets, session: sessionMap[date], byExercise };
      });
  }, [sets, sessionMap]);

  if (days.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-muted">
        No workouts yet. Start logging!
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-3">
      {days.map((day) => {
        const isOpen = expanded === day.date;
        return (
          <div key={day.date} className="bg-surface rounded-xl overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : day.date)}
              className="w-full px-4 py-3 flex items-center justify-between text-left"
            >
              <div className="flex flex-col">
                <span className="font-semibold text-text">{formatDate(day.date)}</span>
                <span className="text-xs text-text-muted">
                  {Object.entries(day.byExercise)
                    .map(([ex, { total }]) => `${total} ${ex === 'plank' ? 'sec' : ''} ${ex}`)
                    .join(' · ')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {day.session && (
                  <span className="text-xs bg-accent/15 text-accent px-2 py-1 rounded-md font-medium">
                    {formatDuration(day.session.durationSeconds)}
                  </span>
                )}
                <svg
                  className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-3 flex flex-col gap-1.5 border-t border-border pt-3">
                {day.sets
                  .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
                  .map((s) => {
                    const unit = s.exercise === 'plank' ? 'sec' : 'reps';
                    return (
                      <div key={s.id} className="flex items-center justify-between text-sm">
                        <span className="capitalize text-text-muted">{s.exercise}</span>
                        <span className="text-text font-medium">{s.reps} {unit}</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
