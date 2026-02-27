import { useState, useMemo } from 'react';
import type { WorkoutSet, SessionSummary } from '../types';

const EXERCISES = ['pushups', 'squats', 'plank'];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function unitFor(exercise: string) {
  return exercise === 'plank' ? 'sec' : 'reps';
}

interface SessionProps {
  active: boolean;
  pendingSets: WorkoutSet[];
  elapsed: number;
  isPaused: boolean;
  onStart: () => void;
  onAddSet: (exercise: string, reps: number) => void;
  onRemoveSet: (id: string) => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
}

interface Props {
  sets: WorkoutSet[];
  session: SessionProps;
  summary: SessionSummary | null;
  onDismissSummary: () => void;
}

// ---------- Summary Screen ----------

function SummaryView({ summary, onDismiss }: { summary: SessionSummary; onDismiss: () => void }) {
  const byExercise = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    for (const s of summary.sets) {
      const entry = map[s.exercise] ??= { total: 0, count: 0 };
      entry.total += s.reps;
      entry.count += 1;
    }
    return map;
  }, [summary.sets]);

  return (
    <div className="flex-1 p-4 pb-2 flex flex-col gap-5">
      <div className="bg-surface rounded-xl p-6 flex flex-col gap-4 border border-border">
        <div className="text-center">
          <div className="text-text-muted text-xs uppercase tracking-wider mb-1">Session Complete</div>
          <div className="font-mono text-3xl font-bold text-accent">{formatTimer(summary.durationSeconds)}</div>
        </div>

        {Object.keys(byExercise).length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            {Object.entries(byExercise).map(([ex, { total, count }]) => (
              <div key={ex} className="flex items-baseline justify-between">
                <span className="capitalize font-medium text-text">{ex}</span>
                <span className="text-text-muted text-sm">
                  <span className="text-accent font-semibold">{total}</span> {unitFor(ex)}
                  <span className="ml-1.5">({count} {count === 1 ? 'set' : 'sets'})</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {summary.sets.length === 0 && (
          <div className="text-center text-text-muted text-sm">No sets logged this session.</div>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="w-full py-3.5 rounded-xl bg-accent text-white font-semibold text-lg active:bg-accent-hover transition-colors"
      >
        Done
      </button>
    </div>
  );
}

// ---------- Idle Screen (no session active) ----------

function IdleView({ sets, onStart }: { sets: WorkoutSet[]; onStart: () => void }) {
  const today = todayStr();

  const todaySummary = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    for (const s of sets) {
      if (s.date !== today) continue;
      const entry = map[s.exercise] ??= { total: 0, count: 0 };
      entry.total += s.reps;
      entry.count += 1;
    }
    return map;
  }, [sets, today]);

  return (
    <div className="flex-1 p-4 pb-2 flex flex-col gap-5">
      {Object.keys(todaySummary).length > 0 && (
        <div className="bg-surface rounded-xl p-4 flex flex-col gap-2">
          <div className="text-text-muted text-xs uppercase tracking-wider">Today's Sets</div>
          {Object.entries(todaySummary).map(([ex, { total, count }]) => (
            <div key={ex} className="flex items-baseline justify-between">
              <span className="capitalize font-medium text-text">{ex}</span>
              <span className="text-text-muted text-sm">
                <span className="text-accent font-semibold">{total}</span> {unitFor(ex)}
                <span className="ml-1.5">({count} {count === 1 ? 'set' : 'sets'})</span>
              </span>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onStart}
        className="w-full py-4 rounded-xl bg-accent text-white font-semibold text-lg active:bg-accent-hover transition-colors"
      >
        Start Session
      </button>
    </div>
  );
}

// ---------- Active Session Screen ----------

function ActiveSessionView({ session }: { session: SessionProps }) {
  const [exercise, setExercise] = useState('pushups');
  const [reps, setReps] = useState(10);
  const isPlank = exercise === 'plank';
  const step = isPlank ? 5 : 1;
  const unit = unitFor(exercise);

  const exerciseSets = useMemo(
    () => session.pendingSets.filter((s) => s.exercise === exercise),
    [session.pendingSets, exercise],
  );
  const exerciseTotal = useMemo(() => exerciseSets.reduce((sum, s) => sum + s.reps, 0), [exerciseSets]);

  function handleAdd() {
    if (reps <= 0) return;
    session.onAddSet(exercise, reps);
  }

  return (
    <div className="flex-1 p-4 pb-2 flex flex-col gap-5">
      {/* Timer bar */}
      <div className="bg-surface rounded-xl px-4 py-3 flex items-center justify-between border border-border">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${session.isPaused ? 'bg-yellow-400' : 'bg-green-400 animate-pulse'}`} />
          <span className="font-mono text-4xl font-bold text-text">{formatTimer(session.elapsed)}</span>
        </div>
        <div className="flex gap-2">
          {session.isPaused ? (
            <button
              onClick={session.onResume}
              className="px-3 py-1.5 rounded-lg bg-accent text-white text-sm font-medium"
            >
              Resume
            </button>
          ) : (
            <button
              onClick={session.onPause}
              className="px-3 py-1.5 rounded-lg bg-surface-alt border border-border text-text text-sm font-medium"
            >
              Pause
            </button>
          )}
        </div>
      </div>

      {/* Exercise selector */}
      <div className="flex gap-2">
        {EXERCISES.map((ex) => (
          <button
            key={ex}
            onClick={() => { setExercise(ex); setReps(ex === 'plank' ? 30 : 10); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              exercise === ex
                ? 'bg-accent text-white'
                : 'bg-surface text-text-muted border border-border'
            }`}
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Rep input with stepper */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setReps((r) => Math.max(step, r - step))}
          className="w-12 h-12 rounded-full bg-surface border border-border text-xl font-bold flex items-center justify-center active:bg-surface-alt transition-colors"
        >
          -{isPlank && 5}
        </button>
        <div className="flex flex-col items-center">
          <input
            type="number"
            inputMode="numeric"
            step={step}
            value={reps}
            onChange={(e) => setReps(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-24 text-center text-4xl font-bold bg-transparent border-b-2 border-accent text-text outline-none"
          />
          <span className="text-text-muted text-xs mt-1">{isPlank ? 'seconds' : 'reps'}</span>
        </div>
        <button
          onClick={() => setReps((r) => r + step)}
          className="w-12 h-12 rounded-full bg-surface border border-border text-xl font-bold flex items-center justify-center active:bg-surface-alt transition-colors"
        >
          +{isPlank && 5}
        </button>
      </div>

      {/* Add Set button */}
      <button
        onClick={handleAdd}
        className="w-full py-3.5 rounded-xl bg-accent text-white font-semibold text-lg active:bg-accent-hover transition-colors"
      >
        Add Set
      </button>

      {/* Pending sets for selected exercise */}
      {exerciseSets.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-text-muted text-xs uppercase tracking-wider">
            Sets — {exercise} ({exerciseTotal} {unit})
          </h3>
          {exerciseSets.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center justify-between bg-surface rounded-lg px-4 py-3"
            >
              <span className="text-text">
                <span className="text-text-muted mr-2">Set {i + 1}</span>
                <span className="font-semibold">{s.reps} {unit}</span>
              </span>
              <button
                onClick={() => session.onRemoveSet(s.id)}
                className="text-danger text-sm opacity-70 hover:opacity-100 transition-opacity"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Finish Session button */}
      <button
        onClick={session.onFinish}
        className="w-full py-3.5 rounded-xl bg-danger/15 text-danger font-semibold text-lg border border-danger/30 active:bg-danger/25 transition-colors"
      >
        Finish Session
      </button>
    </div>
  );
}

// ---------- Main Component ----------

export function LogWorkout({ sets, session, summary, onDismissSummary }: Props) {
  if (summary) {
    return <SummaryView summary={summary} onDismiss={onDismissSummary} />;
  }

  if (session.active) {
    return <ActiveSessionView session={session} />;
  }

  return <IdleView sets={sets} onStart={session.onStart} />;
}
