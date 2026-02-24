import { useState, useEffect, useCallback } from 'react';
import type { WorkoutSet, WorkoutSession } from '../types';

const DB_NAME = 'pushup-tracker';
const DB_VERSION = 2;
const SETS_STORE = 'sets';
const SESSIONS_STORE = 'sessions';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SETS_STORE)) {
        const store = db.createObjectStore(SETS_STORE, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('exercise', 'exercise', { unique: false });
      }
      if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
        const store = db.createObjectStore(SESSIONS_STORE, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function req<T>(r: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}

export function useWorkouts() {
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState<IDBDatabase | null>(null);

  useEffect(() => {
    openDB().then(async (database) => {
      setDb(database);

      const setsStore = database.transaction(SETS_STORE, 'readonly').objectStore(SETS_STORE);
      const allSets = await req<WorkoutSet[]>(setsStore.getAll());
      setSets(allSets.sort((a, b) => a.createdAt.localeCompare(b.createdAt)));

      const sessStore = database.transaction(SESSIONS_STORE, 'readonly').objectStore(SESSIONS_STORE);
      const allSessions = await req<WorkoutSession[]>(sessStore.getAll());
      setSessions(allSessions.sort((a, b) => b.date.localeCompare(a.date)));

      setLoading(false);
    });
  }, []);

  const addSet = useCallback(
    async (date: string, exercise: string, reps: number): Promise<WorkoutSet> => {
      if (!db) throw new Error('DB not ready');
      const entry: WorkoutSet = {
        id: crypto.randomUUID(),
        date,
        exercise,
        reps,
        createdAt: new Date().toISOString(),
      };
      const store = db.transaction(SETS_STORE, 'readwrite').objectStore(SETS_STORE);
      await req(store.add(entry));
      setSets((prev) => [...prev, entry]);
      return entry;
    },
    [db],
  );

  const addSets = useCallback(
    async (entries: WorkoutSet[]) => {
      if (!db || entries.length === 0) return;
      const tx = db.transaction(SETS_STORE, 'readwrite');
      const store = tx.objectStore(SETS_STORE);
      for (const entry of entries) {
        store.add(entry);
      }
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      setSets((prev) => [...prev, ...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
    },
    [db],
  );

  const deleteSet = useCallback(
    async (id: string) => {
      if (!db) return;
      const store = db.transaction(SETS_STORE, 'readwrite').objectStore(SETS_STORE);
      await req(store.delete(id));
      setSets((prev) => prev.filter((s) => s.id !== id));
    },
    [db],
  );

  const clearAll = useCallback(async () => {
    if (!db) return;
    const store = db.transaction(SETS_STORE, 'readwrite').objectStore(SETS_STORE);
    await req(store.clear());
    setSets([]);
  }, [db]);

  const saveSession = useCallback(
    async (date: string, durationSeconds: number) => {
      if (!db) return;
      const session: WorkoutSession = {
        id: crypto.randomUUID(),
        date,
        durationSeconds,
        createdAt: new Date().toISOString(),
      };
      const store = db.transaction(SESSIONS_STORE, 'readwrite').objectStore(SESSIONS_STORE);
      // Use put so a second stop on the same day overwrites
      await req(store.put(session));
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.date !== date);
        return [session, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
      });
    },
    [db],
  );

  return { sets, sessions, loading, addSet, addSets, deleteSet, clearAll, saveSession };
}
