import { useState, useCallback } from 'react';
import { useWorkouts } from './hooks/useWorkouts';
import { useSessionTimer } from './hooks/useSessionTimer';
import { LogWorkout } from './components/LogWorkout';
import { History } from './components/History';
import { Navigation } from './components/Navigation';
import type { Tab, WorkoutSet, SessionSummary } from './types';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function App() {
  const [tab, setTab] = useState<Tab>('log');
  const { sets, sessions, loading, addSets, saveSession } = useWorkouts();
  const timer = useSessionTimer();

  const [pendingSets, setPendingSets] = useState<WorkoutSet[]>([]);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);

  const handleStartSession = useCallback(() => {
    setPendingSets([]);
    setSessionSummary(null);
    timer.start();
  }, [timer]);

  const handleAddPendingSet = useCallback((exercise: string, reps: number) => {
    const entry: WorkoutSet = {
      id: crypto.randomUUID(),
      date: todayStr(),
      exercise,
      reps,
      createdAt: new Date().toISOString(),
    };
    setPendingSets((prev) => [...prev, entry]);
  }, []);

  const handleRemovePendingSet = useCallback((id: string) => {
    setPendingSets((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleFinishSession = useCallback(async () => {
    const duration = timer.stop();
    if (pendingSets.length > 0) {
      await addSets(pendingSets);
    }
    if (duration > 0) {
      await saveSession(todayStr(), duration);
    }
    setSessionSummary({ durationSeconds: duration, sets: pendingSets });
    setPendingSets([]);
  }, [timer, pendingSets, addSets, saveSession]);

  const handleDismissSummary = useCallback(() => {
    setSessionSummary(null);
  }, []);

  const sessionActive = timer.isRunning || timer.isPaused;

  return (
    <>
      <header className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold">PushUp Tracker</h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-text-muted">Loading...</div>
        ) : tab === 'log' ? (
          <LogWorkout
            sets={sets}
            session={{
              active: sessionActive,
              pendingSets,
              elapsed: timer.elapsed,
              isPaused: timer.isPaused,
              onStart: handleStartSession,
              onAddSet: handleAddPendingSet,
              onRemoveSet: handleRemovePendingSet,
              onPause: timer.pause,
              onResume: timer.resume,
              onFinish: handleFinishSession,
            }}
            summary={sessionSummary}
            onDismissSummary={handleDismissSummary}
          />
        ) : tab === 'history' ? (
          <History sets={sets} sessions={sessions} />
        ) : (
          <div className="p-4 text-text-muted">Progress — coming soon</div>
        )}
      </main>

      <Navigation active={tab} onChange={setTab} />
    </>
  );
}
